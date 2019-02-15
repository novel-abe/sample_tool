// eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';

/**
 * Utility function which automatically mounts React components from HTML
 *
 * Usage:
 *   <div data-react="component_file_name" data-props="{\"json\": \"data\"}"></div>
 */
function mountRoot() {
    $('[data-react]').each((_, node) => {
        // Webpack require context for dynamic requires
        const context = require.context('./components', true);
        const componentFileName = $(node).data('react');
        // Require the component using the context
        const Component = context(`./${componentFileName}/index`).default;
        const props = $(node).data('props');

        // Render the root component intially (passing all props), wrapped by the
        // new <AppContainer>
        ReactDOM.render(
            <AppContainer><Component {...props}/></AppContainer>,
            node
        );

        // If hot reloading is enabled in Webpack...
        if (module.hot) {
            // Accept any hot reloads affecting the context ('scripts/components/*')
            module.hot.accept(context.id, () => {
                // Need to _recreate_ the Webpack require context
                const hotContext = require.context('./components', true);
                // Re-import the updated component
                const HotComponent = hotContext(`./${componentFileName}/index`).default;

                // Render the updated component (state will be preserved!)
                ReactDOM.render(
                    <AppContainer><HotComponent {...props}/></AppContainer>,
                    node
                );
            });
        }
    });
}

export {mountRoot};
