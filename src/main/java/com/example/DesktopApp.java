package com.example;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.web.WebView;
import javafx.stage.Stage;

import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

public class DesktopApp extends Application {

    @Override
    public void start(Stage stage) {

        ConfigurableApplicationContext context =
            SpringApplication.run(WebApp.class);

        int port = context.getEnvironment()
                .getProperty("local.server.port", Integer.class);

        WebView webView = new WebView();
        webView.getEngine().load("http://localhost:" + port);

        stage.setTitle("GestioPro");
        stage.setScene(new Scene(webView, 1200, 800));
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}