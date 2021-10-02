const fs = require('fs');
const path = require('path');

class Logger {
	constructor(auditor, defaultName) {
		this.auditor = auditor;
		this.separator = ',';
		this.defaultName = defaultName;
		this.initDir();
	}

	/**
	 * Initialise le rep d'analise.
	 */
	initDir() {
		const analyseDir  = (process.env.PWD || process.env.INIT_CWD) + '/seo_analyse/';

		if (!fs.existsSync(analyseDir)) {
			fs.mkdirSync(analyseDir);
		}

		this.dir = analyseDir + this.auditor.domain + '/';
		let version = 1;

		if (!fs.existsSync(this.dir)) {
			fs.mkdirSync(this.dir);
		} else {
			let versions = this.getDirList(this.dir)
				.map(item => {
					return parseInt(item.replace('v', ''));
				})
				.sort((a, b) => {
					return a > b;
				})

			version  = parseInt(versions.slice(-1)) || 0;
			if( fs.existsSync(`${this.dir}v${version}/${this.defaultName}.csv`) ){
				version = version + 1;
			}
		}

		this.dir += 'v' + version + '/';
		if (!fs.existsSync(this.dir)) {
			fs.mkdirSync(this.dir);
		}
	}


	/**
	 * Log les erreurs.
	 *
	 * @param message
	 * @param data
	 * @param url
	 */
	error(message, data = "", url = "") {
		this.log('error', message, data, url);
	}

	/**
	 * Log
	 *
	 * @param type
	 * @param message
	 * @param data
	 * @param url
	 */
	log(type, message, data, url) {
		const path = this.dir + type + '.csv';
		let values = [
			(url && url.length) > 0 ? url : this.auditor.currentUrl,
			message,
		];
		if (data) {
			values = values.concat(Object.values(data));
			if (!fs.existsSync(path)) {
				fs.writeFileSync(path, (['url', 'message'].concat(Object.keys(data))).join(this.separator) + "\r\n")
			}
		}


		fs.appendFileSync(path, values.map(item => {
			return '"' + item + '"'
		}).join(this.separator) + "\r\n");
	}

	/**
	 * REtourne la liste des versions.
	 *
	 * @param source
	 * @returns {Uint8Array | BigInt64Array | *[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array}
	 */
	getDirList(source) {
		return fs.readdirSync(source, {withFileTypes: true})
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
	}

	getFilesList(source){
		return fs.readdirSync(source, {withFileTypes: true})
			.filter(dirent => dirent.isFile())
			.map(dirent => dirent.name)
	}

	/**
	 * save file.
	 *
	 * @param data
	 * @param name
	 */
	save(data, name) {
		fs.writeFileSync(this.dir + name, data);
	}

	/**
	 * Retourne les logs.
	 * @param name
	 * @returns {*[][]}
	 */
	read(name) {
		const file = this.dir + name + '.csv';
		if( fs.existsSync(file) ){
			return fs.readFileSync(file, 'utf-8')
				.split('\n')
				.map(row => {
					return row.split(this.separator)
						.map(cell => {
							cell = cell.trim();
							if (cell[0] === '"') {
								return cell.slice(1, -1);
							}
							return cell;
						})
				})
		}
		console.log("Vous devez faire un audit seo pour déterminer les pages à tracker.");
		process.exit();

	}
}

module.exports = Logger;
