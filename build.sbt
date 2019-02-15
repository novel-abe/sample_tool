name := "sample_tool"

version := "1.0-SNAPSHOT"

lazy val `sampletool` = (project in file(".")).enablePlugins(PlayJava, PlayEbean)

PlayKeys.devSettings := Seq("play.akka.dev-mode.akka.http.parsing.max-uri-length" -> "16k")

scalaVersion := "2.11.7"

resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases"

resolvers += "Akka Snapshot Repository" at "http://repo.akka.io/snapshots/"

libraryDependencies ++= Seq(
  ehcache,
  ws,
  specs2 % Test,
  guice,
  evolutions,
  javaJdbc,
  javaWs,
  "mysql" % "mysql-connector-java" % "5.1.46"
)