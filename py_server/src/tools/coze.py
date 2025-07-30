import os
from dotenv import load_dotenv
from cozepy import COZE_CN_BASE_URL, Coze, JWTAuth, JWTOAuthApp

load_dotenv()


# The default access is api.coze.cn, but if you need to access api.coze.com,
# please use base_url to configure the api endpoint to access
coze_api_base =  COZE_CN_BASE_URL

jwt_oauth_private_key = ""
# client ID
jwt_oauth_client_id = os.getenv("COZE_JWT_OAUTH_CLIENT_ID")
# path to the private key file (usually with .pem extension)
jwt_oauth_private_key_file_path = os.getenv("COZE_JWT_OAUTH_PRIVATE_KEY_FILE_PATH")
# public key id
jwt_oauth_public_key_id = os.getenv("COZE_JWT_OAUTH_PUBLIC_KEY_ID")

if jwt_oauth_private_key_file_path:
    with open(jwt_oauth_private_key_file_path, "r") as f:
        jwt_oauth_private_key = f.read()


# The sdk offers the JWTOAuthApp class to establish an authorization for Service OAuth.
# Firstly, it is required to initialize the JWTOAuthApp.


jwt_oauth_app = JWTOAuthApp(
    client_id=jwt_oauth_client_id,
    private_key=jwt_oauth_private_key,
    public_key_id=jwt_oauth_public_key_id,
    base_url=coze_api_base,
)

if __name__ == "__main__":
    # Then, it is required to call the get_access_token method to get the access token.
    access_token = jwt_oauth_app.get_access_token()
    print(access_token)
