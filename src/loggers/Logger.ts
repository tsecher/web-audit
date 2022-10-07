import colors from "colors";

export interface LoggerInterface {
    exit(data?: any, id?: any, context?: any): void

    error(data?: any, id?: any, context?: any): void

    warning(data?: any, id?: any, context?: any): void

    success(data?: any, id?: any, context?: any): void

    message(data?: any, id?: any, context?: any): void
}

export class LoggerClass implements LoggerInterface {

    /**
     * Log cache
     */
    cache: any = {
        id: null,
        context: null,
    }

    defaultColor = (x: any) => {
        return x;
    }

    /**
     * {@inheritdoc}
     */
    private log(data: any, id?: any, context?: any, color?: Function): void {
        color = color || this.defaultColor;
        if (this.isNewIdAndContext(id, context)) {
            console.log(color(`======== ${id || ''} : ${context || ''}`));
        }
        console.log(color(data));
    }

    error(data: any, id?: any, context?: any,): void {
        this.log(data, id, context, colors.red);
    }

    message(data: any, id?: any, context?: any,): void {
        this.log(data, id, context);
    }

    success(data: any, id?: any, context?: any,): void {
        this.log(data, id, context, colors.green);
    }

    warning(data: any, id?: any, context?: any,): void {
        this.log(data, id, context, colors.yellow);
    }

    exit(data?: any, id?: any, context?: any): void {
        this.error(data, id, context);
        process.exit();
    }


    private isNewIdAndContext(id: string, context: string) {
        if (!id && !context) {
            return false;
        }
        if (`${id}||${context}` !== `${this.cache.id}||${this.cache.context}`) {
            this.cache.id = id;
            this.cache.context = context;
            return true;
        }

        return false;
    }
}

export const WebAuditLogger = new LoggerClass();