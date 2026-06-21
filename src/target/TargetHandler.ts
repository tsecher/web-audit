import { ModuleInterface } from "##/modules/ModuleInterface";
import { WebAuditContextClass } from "##/core/WebAuditContext";


class TargetHandler {

    public getStructureLabels(stored: ModuleInterface, group_id: string, context: WebAuditContextClass) {
        const headLine = {};
        Object.entries(stored.getSchema().structure[group_id].structure)
        .forEach(([field, structure]) => {
            const definition = context.config.AppConfig.config.targets?.[stored.id]?.[group_id]?.[field] || null
            headLine[field] = structure.label + this.getTargetLabel(structure, definition);
        });

        return headLine;
    }

    getTargetLabel(schema: any, definition:any) {
        // Config is function.
        if(typeof definition === 'function') {
            return '';
        }

        if( schema.values ) {
            const method = 'label_' + (schema.type);
            
            if( typeof this[method] === 'function'){
                const target =  this[method](schema, definition);
                return target.length ? `[${target}]`: ''
            }
        }

        return '';
    }

    label_number(schema:any , configTarget:any) {
        configTarget = configTarget || schema.values.min_target;
        if( schema.values.target > schema.values.min_target){
            return `>= ${configTarget}`;
        }
        return `<= ${configTarget}`;
    }

    label_string(schema:any, configTarget:any){
        configTarget = configTarget || schema.values.min_target;
        if(schema.values.list){
            const indexOfTarget = schema.values.list.indexOf(schema.values.target);
            const indexOfSchemaMinTarget = schema.values.list.indexOf(schema.values.min_target);
            const indexOfConfigTarget = schema.values.list.indexOf(configTarget);           
            
            if( indexOfTarget > indexOfSchemaMinTarget) {
                return schema.values.list.slice(indexOfConfigTarget).join();
            }
            if( indexOfTarget == indexOfSchemaMinTarget) {
                if(indexOfTarget == 0){
                    return schema.values.list.slice(0, indexOfConfigTarget + 1).join();
                }
                return schema.values.list.slice(indexOfConfigTarget).join();
            }
            return schema.values.list.slice(0, indexOfConfigTarget+1).join();
        }

        if(schema.values.empty === false){
            return `not empty`;
        }

        return `configTarget`;
    }

    parseErrorData(stored:ModuleInterface, group_id:string, context: WebAuditContextClass, data:any){
        const result = {
            lineError: false,
            data: {...data},
        };
        
        Object.entries(data).forEach(([key, val]) => {
            const match = this.matchTarget(context, stored, group_id, key, val);
            result.data[key] = {
                value: val,
                definition: match ? match.definition : null,
                error: (match?.match === false) || false,
            }
            result.lineError = result.lineError || (match?.match === false) || false;
        });
        
        return result;
    }

    matchTarget(context: WebAuditContextClass, module: ModuleInterface, group_id: string, field:string, value:any ) {
        if(typeof module.getSchema == "function"){

            // Get schema.
            const schema = module.getSchema()?.structure[group_id]?.structure[field];
            if(!schema){
                return null;
            }

            // Config definition.
            const definition = context.config.AppConfig.config.targets?.[module.id]?.[group_id]?.[field] || null;

            // Config is function.
            if(typeof definition === 'function') {
                return {
                    definition: schema,
                    match: definition(value)
                };
            }
            
            
            if(schema.values ) {
                const method = 'test_'+(schema.type);
                
                if( typeof this[method] === 'function'){
                    return {
                        definition : schema,
                        match: this[method](schema, definition, value),
                    }
                }
            }
        }

        return null;
    }

    /**
     * Test numbers.
     *
     * @param {*} schema 
     * @param {*} configTarget 
     * @param {*} value 
     * @returns 
     */
    test_number(schema:any, configTarget:any, value:any) {
        configTarget = configTarget || schema.values.min_target;
        if( schema.values.target > schema.values.min_target){
            return configTarget <= value;
        }
        return configTarget >= value;
    }

    /**
     * Test string
     * @param {*} schema 
     * @param {*} configTarget 
     * @param {*} value 
     * @returns 
     */
    test_string(schema: any, configTarget:any, value:any) {
        configTarget = configTarget || schema.values.min_target;
        if(schema.values.list){
            const indexOfTarget = schema.values.list.indexOf(schema.values.target);
            const indexOfSchemaMinTarget = schema.values.list.indexOf(schema.values.min_target);
            const indexOfConfigTarget = schema.values.list.indexOf(configTarget);
            const indexOfValue = schema.values.list.indexOf(value);    
            
            if( indexOfTarget > indexOfSchemaMinTarget){
                return indexOfConfigTarget <= indexOfValue;
            }
            return indexOfConfigTarget >= indexOfValue;
        }

        if(schema.values.empty === false){
            return value.length;
        }

        return configTarget === schema.values.target;
    }
}

const targetHandler = new TargetHandler();
export default targetHandler;