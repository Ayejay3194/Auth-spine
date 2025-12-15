export const patterns = [
    {
        "spine": "payments",
        "intent": "create_invoice",
        "re": /create invoice|invoice /i,
        "baseConfidence": 0.7,
        "hint": "create invoice"
    },
    {
        "spine": "payments",
        "intent": "mark_paid",
        "re": /mark (?:it )?paid|paid invoice/i,
        "baseConfidence": 0.7,
        "hint": "mark paid"
    },
    {
        "spine": "payments",
        "intent": "refund",
        "re": /refund/i,
        "baseConfidence": 0.85,
        "hint": "refund"
    }
];
