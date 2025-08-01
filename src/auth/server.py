from flask import Flask,request
from flask_mysqldb import MySQL 
import jwt,os,datetime


server = Flask(__name__)
mysql = MySQL(server)


server.config["MYSQL_HOST"] = os.environ.get("MYSQL_HOST")
server.config["MYSQL_USER"] = os.environ.get("MYSQL_USER")
server.config["MYSQL_PASSWORD"] = os.environ.get("MYSQL_PASSWORD")
server.config["MYSQL_DB"] = os.environ.get("MYSQL_DB")
server.config["MYSQL_PORT"] = int(os.environ.get("MYSQL_PORT", "3306"))




@server.route("/",methods=["GET"])
def home():
    return "Hello world"

@server.route("/login",methods=["POST"])
def login():
    auth = request.authorization
    if not auth:
        return "missing credentials", 401
    
    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            'SELECT email, password FROM User WHERE email = %s', (auth.email,)
        )
        result = cursor.fetchone()
        cursor.close()

        if result:
            email = result[0]
            password = result[1]
            
            if auth.password == password and auth.email == email:
                return createJWT(auth.email, os.environ.get("JWT_SECRET", "default_secret"), True)
            else:
                return "user not authorised", 401
        else:
            return "user not authorised", 401
    except Exception as e:
        print(f"Database error: {e}")
        return "internal server error", 500
    

def createJWT(username, secret, authez):
    token = jwt.encode(
        {
            "username": username,
            "expiry": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1),
            "iat": datetime.datetime.now(datetime.timezone.utc).timestamp(),
            "admin": authez
        },
        secret,
        algorithm="HS256"
    )
    return token


@server.route('/validate', methods=['POST'])
def validate():
    encoded_jwt = request.headers.get('Authorization')
    if not encoded_jwt:
        return "missing credentials", 401 
    
    try:
        encoded_jwt = encoded_jwt.split(" ")[1]
        decoded = jwt.decode(encoded_jwt, os.environ.get("JWT_SECRET", "default_secret"), algorithms=["HS256"])
        return decoded, 200
    except jwt.ExpiredSignatureError:
        return "token expired", 401
    except jwt.InvalidTokenError:
        print("Invalid token")
        return "invalid token", 401
    except Exception as e:
        print(f"Token validation error: {e}")
        return "invalid token", 401


if __name__ == "__main__":
    server.run(host="0.0.0.0", port=6000)








