import os
from dotenv import load_dotenv
from cozepy import COZE_CN_BASE_URL, Coze, JWTAuth, JWTOAuthApp, TokenAuth

load_dotenv()


# The default access is api.coze.cn, but if you need to access api.coze.com,
# please use base_url to configure the api endpoint to access
coze_api_base = COZE_CN_BASE_URL

jwt_oauth_private_key = ""
# client ID
jwt_oauth_client_id = os.getenv("COZE_JWT_OAUTH_CLIENT_ID")
# path to the private key file (usually with .pem extension)
jwt_oauth_private_key_file_path = os.getenv("COZE_JWT_OAUTH_PRIVATE_KEY_FILE_PATH")
# public key id
jwt_oauth_public_key_id = os.getenv("COZE_JWT_OAUTH_PUBLIC_KEY_ID")

if jwt_oauth_private_key_file_path and jwt_oauth_private_key_file_path.strip():
    # 验证路径是否存在且是一个文件
    if os.path.isfile(jwt_oauth_private_key_file_path):
        try:
            with open(jwt_oauth_private_key_file_path, "r") as f:
                jwt_oauth_private_key = f.read()
            print(f"✅ 成功加载私钥文件: {jwt_oauth_private_key_file_path}")
        except (IOError, OSError) as e:
            print(f"❌ 读取私钥文件失败: {e}")
            jwt_oauth_private_key = ""
    else:
        print(f"⚠️  私钥文件不存在或不是有效文件: {jwt_oauth_private_key_file_path}")
        jwt_oauth_private_key = ""


# 验证必要参数是否存在
if not jwt_oauth_private_key:
    print("❌ 警告: 未提供有效的JWT私钥，Coze客户端可能无法正常工作")

if not jwt_oauth_client_id:
    print("❌ 警告: 未提供COZE_JWT_OAUTH_CLIENT_ID")

if not jwt_oauth_public_key_id:
    print("❌ 警告: 未提供COZE_JWT_OAUTH_PUBLIC_KEY_ID")

# The sdk offers the JWTOAuthApp class to establish an authorization for Service OAuth.
# Firstly, it is required to initialize the JWTOAuthApp.

jwt_oauth_app = JWTOAuthApp(
    client_id=jwt_oauth_client_id,
    private_key=jwt_oauth_private_key,
    public_key_id=jwt_oauth_public_key_id,
    base_url=coze_api_base,
)

try:
    coze = Coze(auth=JWTAuth(oauth_app=jwt_oauth_app), base_url=coze_api_base)
    print("✅ Coze客户端初始化成功")
except Exception as e:
    print(f"❌ Coze客户端初始化失败: {e}")
    coze = None

if __name__ == "__main__":
    print(coze.workspaces.list().items)
