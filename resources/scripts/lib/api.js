/* eslint no-param-reassign: ["error", { "props": false }] */
import axios from 'axios';

function mergeParamsWithOptions(params, options) {
    // Add unique param if caching is false (this is the same
    // behaviour as jQuery.ajax)
    if (options.cache === false) {
        delete options.cache;
        params._ = Date.now();
    }

    // Return if params are empty
    if (Object.keys(params).length === 0) return;

    if (options.params) {
        Object.assign(options.params, params);
    } else {
        options.params = params;
    }
}

/**
 * Extract Play FormData errors out of the response
 *
 * @param {Object} err - The error response from Axios
 *
 * @return {Object} - An object containing the FormData errors or null
 *                     if they don't exist
 */
function getApiErrors(err) {
    if (err.status === 400 && err.data) {
        const globalError = err.data[''];
        delete err.data[''];

        const fieldErrors = err.data;

        return {globalError, fieldErrors};
    }

    return null;
}

/**
 * Small wrapper around Axios which makes querying the backend API
 * a bit easier
 */
export default class Api {
    /**
     * Helper function which either sets the API errors (FormData errors) to the current
     * state of the component making the request, or passes the API errors to a callback
     * so the component has more control over how it handles errors.
     *
     * This throws a new error if the response doesn't contain any known API errors, so the
     * component can use a second `.catch()` to handle unknown cases.
     *
     * @param {Object|Function} arg - This can be an object (a React component) or a callback
     *                                which will receive the API errors.
     * @return {Function} - A function (which is passed to a catch handler) that takes
     *                       the error response as an argument.
     */
    static onError(arg) {
        return (err) => {
            const apiErrors = getApiErrors(err);

            if (apiErrors) {
                if (typeof arg === 'function') {
                    arg(apiErrors);
                } else {
                    arg.setState(apiErrors);
                }

                return;
            }

            throw err;
        };
    }

    /**
     * This simply sets given string to window.location.href.
     *
     * The intention of this function is
     * to decouple this class and window.location for tests.
     * @param {String} url - url
     */
    static defaultChangeUrl(url) {
        window.location.href = url;
    }

    constructor(options = {}) {
        this.instance = axios.create({
            baseURL: options.baseURL || '/api/v1/',
            headers: {'X-Requested-With': 'XMLHttpRequest'},
        });
        this.requestQueue = [];
        this.responses = {};
        this.changeUrl = options.changeUrl || Api.defaultChangeUrl;
    }

    /**
     * Adds the response to a map, to later be processed in order
     * @param {Int} index - index
     * @param {Object|Function} callback - callback
     */
    handleResponse(index, callback) {
        // Add the resolver callback to the map of indices and callbacks
        this.responses[index] = callback;

        // If this response the first in the queue, respond immediately
        if (this.requestQueue.indexOf(index) === 0) {
            this.nextResponse();
        }
    }

    /**
     * Keep a list of requests in order
     * @param {Int} index - index
     */
    queueRequest(index) {
        this.requestQueue.push(index);
    }

    /**
     * Process the next response in the queue
     */
    nextResponse() {
        if (this.requestQueue.length) {
            // Take the first item in the queue
            const index = this.requestQueue[0];

            // If there is an index and a response is ready
            if (index !== undefined && this.responses[index]) {
                // Call the resolver callback, thereby allowing the response promise chain
                // to continue
                this.responses[index]();
            }
        }
    }

    finishedResponse(index) {
        const queueIndex = this.requestQueue.indexOf(index);
        // Remove this request from the queue
        this.requestQueue.splice(queueIndex, 1);
        // Process the next response
        this.nextResponse();
    }

    handleRequest(requestPromise, wait) {
        if (wait) {
            // First, keep a log of each request made in order
            const index = this.requestQueue.length;
            this.queueRequest(index);

            // Create a callback that responses call when they are finished
            const done = () => this.finishedResponse(index);

            // We make the request straight away, so everything
            // is parallel
            return requestPromise.then((response) => {
                response.done = done;
                // When a response is received, we create a new promise and
                // return it. This blocks the 'then' chain until this promise is
                // resolved.
                return new Promise((resolve) =>
                    // We add the resolver callback to a map of request indices and
                    // callbacks. This makes sure this response promise is only resolved
                    // in order.
                    this.handleResponse(index, () => resolve(response))
                );
            }).catch((err) => this.handleError(err, done));
        }

        return requestPromise.catch((err) => this.handleError(err, null));
    }

    get(path, params = {}, options = {}) {
        mergeParamsWithOptions(params, options);

        return this.handleRequest(this.instance.get(path, options), options.wait);
    }

    delete(path, params = {}, options = {}) {
        mergeParamsWithOptions(params, options);

        return this.handleRequest(this.instance.delete(path, options), options.wait);
    }

    post(path, data = {}, options = {}) {
        return this.handleRequest(this.instance.post(path, data, options), options.wait);
    }

    /**
     * error handler
     *
     * When we got errors from server,
     * we will redirect to /error/:status default.
     * But the error has `X-Location` header,
     * we will redirect to the URL that the header points.
     *
     * Remarks:
     * We think 401 is session timeout or kickout.
     * We assumes 401 without `X-Location` header means session timeout.
     * @param {Object} err - The error response from handleError
     * @param {Object} done - done
     */
    handleError(err, done) {
        const defaultHref = (err.response.status === 401) ? '/' : `/error/${err.response.status}`;

        this.changeUrl((err.response.headers && err.response.headers['X-Location']) || defaultHref);

        err.response.done = done;

        throw err;
    }
}
