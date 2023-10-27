![alt text](./resources/sweatflix.png)

# README

This is the repository for the Sweatflix application. The application should behave like a streaming service for fitness workouts. The application is developed with the Ionic framework and uses the Vue.js framework for the frontend. The application is developed for the Android and iOS platforms.

## Building

To build a Vue3 project, follow these steps:

1. Install Node.js and npm on your machine if you haven't already.
2. Open a terminal or command prompt and navigate to the directory where your project is located.

3. Install the project dependencies:

   ```
   npm install
   ```

4. Start the development server:

   ```
   npm run dev
   ```

   This will start a development server and open your project in a web browser.

5. Build the project for production:

   ```
   npm run build
   ```

   This will build your project for production and create a `dist` directory with the compiled files.

6. Now synchronize all capacitor plugins and custom resources to your native platforms:

   ```
   npx cap sync
   ```

   This will copy all web assets into your native platforms, and rebuild them.

7. Now you can run one of the following commands to start the simulations:

   ```
   npx cap open ios
   npx cap open android
   ```

   This will open your project in the respective IDEs. From there, you can build and run your app on a simulator or device.
   Pleas ensure that you have installed the Android Studio and Xcode IDEs on your machine.

   For direct simulation on a device, you can also use the following commands:

   ```
   ionic cap run ios -l --external
   ionic cap run android -l --external
   ```

   This will start the app on your device and open a live-reload server. You can then connect to the server from your device by opening the provided URL in the browser.

   For more information, see the [Capacitor documentation](https://capacitorjs.com/docs).

## Project Structure

The project is structured as follows:

- The `node_modules` folder contains all dependencies of the project.
- The `public` folder contains the `index.html` file, which is the entry point for the application.
- The `resources` folder contains the icon of the application.
- The `src` folder contains the source code of the application.
- The `assets` folder contains all static assets of the application.
- The `components` folder contains all components of the application.
- The `router` folder contains the router configuration of the application.
- The `store` folder contains the Vuex store of the application.
- The `views` folder contains all views of the application. The `App.vue` file is the root component of the application.
- The `main.js` file is the entry point of the application.
- The `.gitignore` file contains all files and folders that are ignored by Git.
- The `babel.config.js` file contains the configuration for the Babel compiler.
- The `capacitor.config.json` file contains the configuration for the Capacitor framework.
- The `package-lock.json` file contains the dependency tree of the project.
- The `package.json` file contains the metadata of the project.
- The `README.md` file contains the documentation of the project.
- The `vue.config.js` file contains the configuration for the Vue CLI.
