// Adopts the UIScene life cycle required by iOS 27 (Expo's EXExpoAppSceneDelegate creates the window).
const { withInfoPlist, withAppDelegate } = require("expo/config-plugins");

const SCENE_DELEGATE = "EXExpoAppSceneDelegate";

const withSceneManifest = (config) =>
  withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: SCENE_DELEGATE,
          },
        ],
      },
    };
    return cfg;
  });

const withSceneAppDelegate = (config) =>
  withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== "swift") {
      throw new Error("withSceneLifecycle only supports a Swift AppDelegate");
    }
    let src = cfg.modResults.contents;

    if (!src.includes("ExpoReactNativeFactoryProvider")) {
      src = src.replace(
        /class AppDelegate: ExpoAppDelegate \{/,
        "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {"
      );
    }

    // The scene delegate creates the window and starts React Native instead.
    src = src.replace(
      /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\n/,
      "    // Window and React Native start in ExpoAppSceneDelegate (scene life cycle).\n"
    );

    cfg.modResults.contents = src;
    return cfg;
  });

module.exports = (config) => withSceneAppDelegate(withSceneManifest(config));
