import colors from 'colors';

/**
 * Logger Interface.
 */
export interface LoggerInterface {

  /**
   * Name.
   *
   * @returns {string}
   */
  get name(): string;

  /**
   * ID.
   *
   * @returns {string}
   */
  get id(): string;


  /**
   * Log a message.
   *
   * @param data
   * @param id
   */
  message(data?: any, id?: string): void;

  /**
   * Log a success message.
   *
   * @param data
   * @param id
   */
  success(data?: any, id?: string): void;

  /**
   * Log a warning message.
   *
   * @param data
   * @param id
   */
  warning(data?: any, id?: string): void;

  /**
   * Log an error message.
   *
   * @param data
   * @param id
   */
  error(data?: any, id?: string): void;

  /**
   * Log an error message and exit process.
   *
   * @param data
   * @param id
   */
  exit(data?: any, id?: string): void;

  /**
   * Log results.
   *
   * @param {string} name
   * @param data
   * @param {string} id
   */
  result(name: string, data: any, id?: string): void;
}

/**
 * Logger class.
 */
export class LoggerClass implements LoggerInterface {

  get id(): string {
    return 'console';
  }

  get name(): string {
    return 'Console';
  }

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

  result(name: string, values: any, id?: string): void {
    this.log(`${colors.bgGreen(`[${name}] : `)}`, id);
    console.table({values}, Object.keys(values)
      .filter((item) => item !== 'url'));
  }

  /**
   * {@inheritdoc}
   */
  private log(data: any, id?: string, color?: Function): void {
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
