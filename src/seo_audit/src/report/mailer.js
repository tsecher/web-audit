const UrlTools = require('../tools/url-tools');
const Logger = require("../tools/logger")
const fs = require("fs");
const path = require("path")

class Mailer extends UrlTools {

    /**
     * Constructor.
     *
     * @param url
     * @param mail
     */
    constructor(url, mail, auth=null) {
        super(url)
        this.logger = new Logger(this, 'mailer');
        if( auth ){
            this.auth = auth;
        }
    }

    async initAuth() {
        if( !this.auth ){
            this.auth = await this._getAuth()
        }
    }

    /**
     * Envoie de mail.
     */
    async send() {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: this.auth,
        })

        transporter.sendMail(this._getOptions()).then(result => {
            console.log(result)
        }).catch((error) => {
            console.log(error)
        });
    }

    /**
     *
     * @return {{attachments: *, subject: string, from: string, to: string, text: string}}
     * @private
     */
    _getOptions() {
        return {
            from: 'me@thomas-secher.fr',
            to: 'tsecher.lv@gmail.com',
            subject: 'Report',
            text: `Voilà le report pour ${this.baseUrl}!`,
            attachments: this._getAttachments()
        }
    }

    /**
     *
     * @private
     */
    _getAttachments() {
        return fs.readdirSync(this.logger.dir)
            .map(name => {
                return {
                    filename: name,
                    content: fs.createReadStream(path.join(this.logger.dir, name))
                }
            })
    }

    async _getAuth() {
        let auth;
        const authFilePath = path.join(this.logger.dir, '..', 'auth.json')
        if (fs.existsSync(authFilePath)) {
            auth = require(authFilePath)
        } else {
            const prompts = require('prompts');
            auth = await prompts([
                {
                    type: 'text',
                    name: 'user',
                    message: `Compte gmaild e l'envoyeur ? `,
                },
                {
                    type: 'password',
                    name: 'pass',
                    message: 'Password ?',
                },
                {
                    type: 'toggle',
                    name: 'save',
                    message: 'Save ?',
                    initial: true,
                }
            ])

            if( auth.save ){
                fs.writeFileSync(authFilePath, JSON.stringify(auth))
            }
        }

        return auth;
    }
}

module.exports = Mailer;
