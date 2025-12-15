export const patterns = [
    {
        "spine": "crm",
        "intent": "find_client",
        "re": /find client|lookup client|who is/i,
        "baseConfidence": 0.65,
        "hint": "find client"
    },
    {
        "spine": "crm",
        "intent": "add_note",
        "re": /add note|note /i,
        "baseConfidence": 0.7,
        "hint": "add note"
    },
    {
        "spine": "crm",
        "intent": "tag_client",
        "re": /tag /i,
        "baseConfidence": 0.65,
        "hint": "tag client"
    },
    {
        "spine": "crm",
        "intent": "flag_donotbook",
        "re": /do not book|ban client|block client/i,
        "baseConfidence": 0.8,
        "hint": "do not book"
    }
];
