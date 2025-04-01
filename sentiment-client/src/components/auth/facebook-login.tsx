import React from "react";
import FacebookLogin, {
  ReactFacebookFailureResponse,
  ReactFacebookLoginInfo,
} from "react-facebook-login";

const FacebookLoginButton = ({ onLogin }) => {
  const responseFacebook = async (
    userInfo: ReactFacebookLoginInfo | ReactFacebookFailureResponse
  ) => {
    console.log("Facebook response:", userInfo);
    if (userInfo?.accessToken) {
      // Send accessToken to backend for verification
      // const res = await fetch("http://localhost:3000/auth/callback", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ accessToken: response.accessToken }),
      // });

      // const data = await res.json();
      onLogin(userInfo);
    }
  };

  return (
    <FacebookLogin
      appId={"671984205227243"}
      autoLoad={false}
      fields="name,email,picture"
      scope="instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content"
      callback={responseFacebook}
      redirectUri={"http://localhost:3000/auth/callback"}
      icon="fa-facebook"
    />
  );
};

export default FacebookLoginButton;
