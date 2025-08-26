# Module - Schema

## Introduction

The schema described the structure of the data given by a module. It should follow the default structure of the schema.

## Schema structure

The schema describes the module and the data it will generate.
It defines the module, the group of data and each data.

### The module
The module is described by :
- "id": The module unique id.
- "label" : The label
- "description" : The module description
- "types" : The module types :
  - "page" : Module can be used in web page analysis
  - "domain": Module can be used for domain analysis
  - "journey": Module can be used for domain analysis
- "structure": The structure of data groups.

### The data groups
The data groups are described by : 
- "id" : The id of the group.
- "label" : The label of the group
- "description" : The description of the group
- "structure" : The list of data in the group.

### The data 
Each data can is defined by :
- "id" : The data id.
- "label" : The data label.
- "description": The data description
- "type": The data type
  - "string": String
  - "number": Number (float)
  - "boolean": Boolean
  - "blob": For file content
  - "json": Json string.
- "values": The description of the values
- "target" : The target of the indicator (the expected perfect value)
- "min_target" : The default acceptable value to reach a target
- "list": The potential list of values allowed.

### Example

```json
{
  "id": "module_id",
  "label": "Module 1",
  "description": "Description of the module",
  "types": [
    "page"
  ],
  "structure": {
    "id_group_1": {
      "label": "Group 1",
      "description": "Description of group 1",
      "structure": {
        "id_data_1": {
          "label": "Data 1",
          "description": "Description of Data 1",
          "type": "number",
          "values": {
            "target": 1,
            "min_target": 0.8
          }
        },
        "id_data_2": {
          "label": "Data 2",
          "description": "Description of Data 2",
          "type": "string",
          "values": {
            "target": "A",
            "min_target": "B",
            "list": [
              "A",
              "B",
              "C",
              "D",
              "E",
              "F"
            ]
          }
        }
      }
    }
  }
}
```
