#!/bin/bash

# Cleanup script for uploaded zip files
# Organizes implemented and pending zip files

echo "🧹 Cleaning up uploaded zip files..."

# Create directories for organization
mkdir -p implemented-zips
mkdir -p pending-zips
mkdir -p archive-zips

# Move implemented zips to implemented-zips
echo "✅ Moving implemented zip files..."
mv ultimate-business-spine.zip implemented-zips/
mv ultimate-platform-security-pack.zip implemented-zips/

# Move security-related zips to pending-zips (for future implementation)
echo "📋 Moving security zip files to pending..."
mv *security*.zip pending-zips/
mv *saas*.zip pending-zips/
mv *supabase*.zip pending-zips/

# Move compliance and ops zips to archive
echo "📦 Moving compliance and ops zip files to archive..."
mv *compliance*.zip archive-zips/
mv *ops*.zip archive-zips/
mv *hr*.zip archive-zips/
mv *legal*.zip archive-zips/
mv *vibe*.zip archive-zips/
mv *disaster*.zip archive-zips/
mv *booking*.zip archive-zips/
mv *beauty*.zip archive-zips/
mv *astro*.zip archive-zips/
mv *assistant*.zip archive-zips/
mv *data*.zip archive-zips/
mv *governance*.zip archive-zips/
mv *internal*.zip archive-zips/
mv *luxe*.zip archive-zips/
mv *payment*.zip archive-zips/
mv *platform*.zip archive-zips/
mv *pr*.zip archive-zips/
mv *sanitization*.zip archive-zips/

echo "🎯 Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "- Implemented zips: $(ls implemented-zips/ | wc -l) files"
echo "- Pending zips: $(ls pending-zips/ | wc -l) files"  
echo "- Archived zips: $(ls archive-zips/ | wc -l) files"
echo ""
echo "✅ Repository is now clean and organized!"
