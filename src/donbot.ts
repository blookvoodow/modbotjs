import * as request from 'request';
import * as requestp from 'request-promise';


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

    function init(): Promise<void> {
        return Promise.resolve(rp.post('/ucp.php?mode=login', {
            formData: {
                username,
                password,
                login: 'Login'
            }
        }));
    }
        
    function getUserId(_username?: string): Promise<number|void> {
        _username = _username || username;
        _username = _username.replace(' ', '+');

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