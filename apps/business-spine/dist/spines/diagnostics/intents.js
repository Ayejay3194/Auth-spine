export const patterns = [
    {
        "spine": "diagnostics",
        "intent": "run_diagnostics",
        "re": /run diagnostics|health check|system check|diag|system status/i,
        "baseConfidence": 0.85,
        "hint": "diagnostics"
    },
    {
        "spine": "diagnostics",
        "intent": "check_database",
        "re": /check database|db health|database status/i,
        "baseConfidence": 0.75,
        "hint": "database check"
    },
    {
        "spine": "diagnostics",
        "intent": "check_redis",
        "re": /check redis|cache health|redis status/i,
        "baseConfidence": 0.75,
        "hint": "redis check"
    },
    {
        "spine": "diagnostics",
        "intent": "check_queue",
        "re": /check queue|queue health|message queue status/i,
        "baseConfidence": 0.75,
        "hint": "queue check"
    }
];
