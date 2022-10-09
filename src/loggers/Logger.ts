import colors from 'colors';

import {WebAuditContextClass as ContextClass, WebAuditContext as Context} from '../core/WebAuditContext';

/**
 * Logger Interface.
 */
export interface LoggerInterface {

  /**
   * Log a message.
   *
   * @param data
   * @param context
   */
  message(data?: any, id?: string): void;

  /**
   * Log a success message.
   *
   * @param data
   * @param context
   */
  success(data?: any, id?: string): void;

  /**
   * Log a warning message.
   *
   * @param data
   * @param context
   */
  warning(data?: any, id?: string): void;

  /**
   * Log an error message.
   *
   * @param data
   * @param context
   */
  error(data?: any, id?: string): void;

  /**
   * Log an error message and exit process.
   *
   * @param data
   * @param context
   */
  exit(data?: any, id?: string): void;
}

/**
 * Logger class.
 */
export class LoggerClass implements LoggerInterface {

  /**
   * Log cache
   */
  previousContext?: ContextClass;

  error(data: any, id?: string): void {
    this.log(data, id, colors.red);
  }

  message(data: any, id?: string): void {
    this.log(data, id);
  }

  success(data: any, id?: string): void {
    this.log(data, id, colors.green);
  }

  warning(data: any, id?: string): void {
    this.log(data, id, colors.yellow);
  }

  exit(data?: any, id?: string): void {
    this.error(data, id);
    process.exit();
  }

  /**
   * {@inheritdoc}
   */
  private log(data: any, id?: string, color?: Function): void {
    if (!Context.current?.isSame(this.previousContext)) {
      console.log(`======== ${Context.current?.toString()}`);
      this.previousContext = Context.current;
    }

    const variables = [];
    if (id) {
      variables.push(`[${id}] `);
    }
    variables.push(data);

    if (color) {
      console.log(color(...variables));
    } else {
      console.log(...variables);
    }
  }
}

/**
 * Default logger class.
 */
export const WebAuditLogger = new LoggerClass();
