export const patterns = [
    {
        "spine": "booking",
        "intent": "book",
        "re": /(?:^| )book( |$)|schedule|appointment/i,
        "baseConfidence": 0.75,
        "hint": "book/schedule"
    },
    {
        "spine": "booking",
        "intent": "cancel",
        "re": /cancel|call off/i,
        "baseConfidence": 0.8,
        "hint": "cancel"
    },
    {
        "spine": "booking",
        "intent": "list",
        "re": /list (?:bookings|appointments)|show (?:my )?schedule|what's on/i,
        "baseConfidence": 0.65,
        "hint": "list schedule"
    }
];
