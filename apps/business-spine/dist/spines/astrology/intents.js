export const patterns = [
    {
        "spine": "astrology",
        "intent": "get_chart",
        "re": /get chart|show chart|my chart|birth chart|natal chart/i,
        "baseConfidence": 0.85,
        "hint": "chart reading"
    },
    {
        "spine": "astrology",
        "intent": "read_placement",
        "re": /what (?:does|is|about) my|tell me about|explain (?:my )?(?:sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|ascendant|midheaven)/i,
        "baseConfidence": 0.80,
        "hint": "placement reading"
    },
    {
        "spine": "astrology",
        "intent": "daily_transit",
        "re": /daily|today['s]* (?:transits|astrology|forecast)|what['s]* happening today|current transits/i,
        "baseConfidence": 0.75,
        "hint": "daily transit"
    },
    {
        "spine": "astrology",
        "intent": "compatibility",
        "re": /compatibility|synastry|relationship (?:with|between)|match with|how do (?:we|I) work together/i,
        "baseConfidence": 0.70,
        "hint": "compatibility"
    },
    {
        "spine": "astrology",
        "intent": "house_interpretation",
        "re": /(?:1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th) house|house (?:1|2|3|4|5|6|7|8|9|10|11|12)/i,
        "baseConfidence": 0.75,
        "hint": "house interpretation"
    },
    {
        "spine": "astrology",
        "intent": "aspect_explanation",
        "re": /aspect|conjunction|opposition|trine|square|sextile|(?:sun|moon|mercury|venus|mars) (?:opposite|trine|square|sextile|conjunct)/i,
        "baseConfidence": 0.70,
        "hint": "aspect explanation"
    },
];
