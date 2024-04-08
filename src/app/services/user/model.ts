
export interface IAppMenu {
    name: string;
    url_auth: string;
}


export interface IUser {
    uuid: string;
    name: string;
    email: string;
    backend_token: string;
    provider_token: string;
    provider_refresh_token: string;
    apps: Array<string>;
    permissions: Array<string>;
    apps_menu: Array<IAppMenu>;
}


export class User implements IUser {

    public uuid: string;
    public name: string;
    public email: string;
    public backend_token: string;
    public provider_token: string;
    public provider_refresh_token: string;
    public apps: Array<string>;
    public permissions: Array<string>;
    public apps_menu: Array<IAppMenu>;

    constructor(){
        this.uuid = '';
        this.name = '';
        this.email = '';
        this.backend_token = '';
        this.provider_token = '';
        this.provider_refresh_token = '';
        this.apps = [];
        this.permissions = [];
        this.apps_menu = [];
    }
}
