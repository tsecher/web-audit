# Module - Schema

## Introduction

The schema described the structure of the data given by a module. It should follow the default structure of the schema.

## Schema structure

The schema can define several groups of data. Each group of data is defined by

- "id" : The id of the group.
- "label" : The label of the group
- "description" : The description of the group
- "structure" : The list of data in the group. Each data can is defined by :
    - "id" : The data id.
    - "label" : The data label.
    - "description": The data description
    - "type": The data type (string|number|blob|json)
    - "values": The description of the values
      - "target" : The target of the indicator (the expected perfect value)
      - "min_target" : The default acceptable value to reach a target
      - "list": The potential list of values allowed.

Example

```json
{
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
```
