#!/bin/bash
curl http://localhost:3200/api/v1/prediction/607074c2-f4f8-49ab-85be-9f0b851a1511 \
     -X POST \
     -d '{"question": "Can you create a stat block for my level 4 goblin mage, and have the stat block create a name for him (do not pass in a name)?"}' \
     -H "Content-Type: application/json"