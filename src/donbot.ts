import * as request from 'request';
import * as requestp from 'request-promise';
import axios from 'axios';
import * as FormData from "form-data";
import * as qs from 'qs';


export interface IDonBot {
    init: () => Promise<void>;

    getUserId: (username?: string) => Promise<number|void>;
    getPostCount: (threadUrl?: string) => number;
    makePost: (content: string, threadUrl?: string) => void;
    sendPm: (sendTo: string|string[], content: string) => void;
}

interface IDontBotOptions {
    username: string;
    password: string;
    baseUrl?: string;
    threadUrl?: string;
}

export function DonBot(options: IDontBotOptions): IDonBot {
    let {
        username,
        password,
        baseUrl = 'https://forum.mafiascum.net/',
        threadUrl
    } = options;

    let rp = requestp.defaults({
        baseUrl,
        timeout: 3000,
        jar: true
    });

    let ajax = axios.create({
        baseURL: baseUrl,
        timeout: 3000,
        withCredentials: true
    })

    function init(): any {
        return Promise.resolve(rp.post('/ucp.php?mode=login', {
            formData: {
                username,
                password,
                login: 'Login'
            }
        })).then(x => x);

        let data = new FormData()
        data.append('username', username)
        data.append('password', password)
        data.append('login', 'Login')
        data.append('autologin', 'on')

        // let data = {
        //     username,
        //     password,
        //     login: 'Login',
        //     autologin: 'on'
        // } 

        return ajax.post('/ucp.php?mode=login', data, { headers: data.getHeaders() })
            .then(x => x)
    }
        
    function getUserId(_username?: string): Promise<number|void> {
        _username = _username || username;
        _username = _username.replace(' ', '+');

        let data = {
            keywords: '',
            terms: 'all',
            author: _username
        }

        // return ajax.get('/search.php?keywords=&terms=all&author=yessiree')
        //     .then(response => {
        //         console.log(response.data)
        //     }).catch(err => {
        //         console.log(err)
        //     })

        let blueBirdProm = rp.get('/search.php', {
            useQuerystring: true,
            qs: {
                keywords: '',
                terms: 'all',
                author: _username
            }
        }).then(response => {
            console.log('success');
            return 0;
        }).catch(error => {
        });

        return Promise.resolve(blueBirdProm);
    }

    function getPostCount(threadUrl?: string) {
        return 0;
    }

    function makePost(content: string, threadUrl?: string) {

    }

    function sendPm(sendTo: string|string[], content: string) {

    }

    return {
        init,
        getUserId,
        getPostCount,
        makePost,
        sendPm
    }
}