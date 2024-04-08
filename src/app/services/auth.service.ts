import { Injectable } from '@angular/core';
import { IUser, User } from './user/model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthenticationDetails, CognitoRefreshToken, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

    public venv: string;
    public user: IUser;
    public auth_loading: boolean;
    public auth_error: string;
    private auth_backend_url: string;
    private user_pool_id: string;
    private client_id: string;
    private pool_data: {
        UserPoolId: string,
        ClientId: string
    };
    private provider_url_auth: string;

    constructor(private router: Router, private http: HttpClient) {
        this.venv = 'dev';

        this.user = new User();
        this.auth_loading = false;
        this.auth_error = "";

        if (this.venv == 'prod'){
            this.provider_url_auth = "https://frst-auth-prod.auth.us-east-1.amazoncognito.com/login";
            this.auth_backend_url = 'https://api-auth.frstfalconi.cloud/api/v1/auth';
            this.user_pool_id = 'us-east-1_RJHQfync9'
            this.client_id = '1jlnkt0po4fbr9dsbqscdnur6l'
        }else{
            this.provider_url_auth = "https://frst-auth.auth.us-east-1.amazoncognito.com/login";
            this.auth_backend_url = 'https://api-auth.dev.frstfalconi.cloud/api/v1/auth';
            this.user_pool_id = 'us-east-1_eMuB1axWp'
            this.client_id = '34ce5r20d4ckfb79dtp2554dp3'
        } 

        this.pool_data = {
            UserPoolId: this.user_pool_id,
            ClientId: this.client_id
        };        
    }

    public refreshToken(){

        let user_pool = new CognitoUserPool(this.pool_data);
        let user_data = { Username: this.user.email, Pool: user_pool };
        var cognito_user = new CognitoUser(user_data);

        var user = this.user;
        var loginBackend = this.loginBackend;
        var token = new CognitoRefreshToken({RefreshToken: this.user.provider_refresh_token });
        cognito_user.refreshSession(token, function (err: any, session: any) {
            console.log(err, session);
            user.provider_token = session.getIdToken().getJwtToken();
            user.provider_refresh_token = session.getIdToken().getRefreshToken().getToken();
            loginBackend(user.provider_token);
        })
    }

    public login(username: string, password: string): void {
        this.user = new User();
        this.loginProvider(username, password);     
    }

    public loginProvider(username: string, password: string): void {
        this.auth_loading = true;
        let authenticationDetails = new AuthenticationDetails({
            Username: username,
            Password: password,
        });
  
        let user_pool = new CognitoUserPool(this.pool_data);
        let user_data = { Username: username, Pool: user_pool };
        var cognito_user = new CognitoUser(user_data);

        cognito_user.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                this.user.provider_token = result.getAccessToken().getJwtToken();
                this.user.provider_refresh_token = result.getRefreshToken().getToken();
                console.log(this.user.provider_token);
                this.loginBackend(this.user.provider_token);
            },
            onFailure: (error) => {
                this.auth_error = error.message || JSON.stringify(error);
                this.auth_loading = false;
            },
        });  
    }

    public loginBackend(provider_token: string): void {
        this.auth_loading = true;
        this.http.post<IUser>(this.auth_backend_url, {provider_token: provider_token}).subscribe({
            next: data => {
                this.user.uuid = data.uuid;
                this.user.name = data.name;
                this.user.email = data.email;
                this.user.backend_token = data.backend_token;
                this.user.provider_token = provider_token;
                this.user.apps = data.apps;
                this.user.permissions = data.permissions;
                this.user.apps_menu = data.apps_menu;

                this.auth_error = "";
                this.auth_loading = false;
                this.router.navigate(["/"])
            },
            error: error => {
                this.auth_error = error.message || JSON.stringify(error);
                this.auth_loading = false;
            }
        });
    }

    public isLoggedIn(): boolean {
        var is_auth = false;
    
        var user_pool = new CognitoUserPool(this.pool_data);
        var cognito_user = user_pool.getCurrentUser();
    
        if (cognito_user != null) {
            cognito_user.getSession((error: any, session: any) => {
                if (error) {
                    this.auth_error = error.message || JSON.stringify(error);
                    this.auth_loading = false;
                }
            
                if(this.user.uuid === ''){
                    this.loginBackend(session.getAccessToken().getJwtToken());
                }

                is_auth = session.isValid();
            });
        }
        return is_auth;
    }

    public logout(): void {
        var user_pool = new CognitoUserPool(this.pool_data);
        var cognito_user = user_pool.getCurrentUser();
        cognito_user?.signOut();
        this.router.navigate(["login"]);
    }

    public checkLoggedIn(): void {
        if(this.isLoggedIn()) {
            this.router.navigate(['/']);
        }
    }

    public redirectToApp(app_url: string): void {
        window.open(`${app_url}?provider_token=${this.user.provider_token}`, "_blank");
    }
}
