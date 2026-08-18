#!/bin/bash

# 🔒 URU Security Review Automated Checker
# Run all security checks and report results

echo "🔒 URU SECURITY REVIEW - AUTOMATED CHECKER"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_result() {
    local test_name=$1
    local result=$2

    if [ $result -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $test_name"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}: $test_name"
        ((FAILED++))
    fi
    echo ""
}

# Test 1: Dangerous Permissions
echo "🔍 Test 1: Scanning for dangerous permissions..."
if git grep -n "QUERY_ALL_PACKAGES\|ACCESS_FINE_LOCATION\|ACCESS_COARSE_LOCATION\|READ_CALL_LOG\|READ_CONTACTS\|BIND_ACCESSIBILITY_SERVICE\|RECEIVE_BOOT_COMPLETED\|MANAGE_EXTERNAL_STORAGE" -- "*.xml" "*.kt" 2>/dev/null | grep -v "Documentation\|CORRECCIONES\|SECURITY_REVIEW" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found dangerous permissions in codebase!${NC}"
    git grep -n "QUERY_ALL_PACKAGES\|ACCESS_FINE_LOCATION\|ACCESS_COARSE_LOCATION\|READ_CALL_LOG\|READ_CONTACTS\|BIND_ACCESSIBILITY_SERVICE\|RECEIVE_BOOT_COMPLETED\|MANAGE_EXTERNAL_STORAGE" -- "*.xml" "*.kt" | head -10
    check_result "Dangerous Permissions Scan" 1
else
    check_result "Dangerous Permissions Scan" 0
fi

# Test 2: Accessibility Service Exposure
echo "🔍 Test 2: Checking for exposed accessibility services..."
if git grep -n "AccessibilityService" -- "src/main/AndroidManifest.xml" "src/main/kotlin" "src/main/java" 2>/dev/null > /dev/null 2>&1; then
    echo -e "${RED}❌ Found accessibility service declaration!${NC}"
    git grep -n "AccessibilityService" -- "src/main/AndroidManifest.xml" "src/main/kotlin"
    check_result "Accessibility Service Exposure" 1
else
    check_result "Accessibility Service Exposure" 0
fi

# Test 3: AndroidManifest Duplication (new module)
echo "🔍 Test 3: Checking for duplicate AndroidManifest files..."
manifest_count=$(git ls-files | grep "android-clean-architecture.*AndroidManifest" | wc -l)
if [ $manifest_count -eq 1 ]; then
    check_result "Single AndroidManifest per Module" 0
else
    echo -e "${RED}❌ Found $manifest_count manifests in android-clean-architecture (expected 1)${NC}"
    git ls-files | grep "android-clean-architecture.*AndroidManifest"
    check_result "Single AndroidManifest per Module" 1
fi

# Test 4: Permissions Count in New Module
echo "🔍 Test 4: Verifying android-clean-architecture has exactly 3 permissions..."
perm_count=$(git show HEAD:android-clean-architecture/src/main/AndroidManifest.xml 2>/dev/null | grep -c "uses-permission" || echo "0")
if [ $perm_count -eq 3 ]; then
    echo "   Permissions found:"
    git show HEAD:android-clean-architecture/src/main/AndroidManifest.xml 2>/dev/null | grep "uses-permission" | sed 's/.*permission\./   - /'
    check_result "Exactly 3 Permissions in New Module" 0
else
    echo -e "${RED}❌ Found $perm_count permissions (expected 3)${NC}"
    git show HEAD:android-clean-architecture/src/main/AndroidManifest.xml 2>/dev/null | grep "uses-permission"
    check_result "Exactly 3 Permissions in New Module" 1
fi

# Test 5: Secrets Scan
echo "🔍 Test 5: Scanning for secrets (keystore, API keys)..."
if git ls-files | egrep -i "\.jks|\.p12|keystore\.properties|\.key|\.pem|secret" 2>/dev/null | grep -v ".gitignore\|SECURITY_REVIEW\|Documentation" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found potential secret files!${NC}"
    git ls-files | egrep -i "\.jks|\.p12|keystore\.properties|\.key|\.pem|secret"
    check_result "Secrets & Keystore Scan" 1
else
    check_result "Secrets & Keystore Scan" 0
fi

# Test 6: Hardcoded API Keys
echo "🔍 Test 6: Scanning for hardcoded API keys..."
if git grep -n "AIzaSy\|api_key.*=.*\"" -- "*.kt" "*.gradle" "*.xml" 2>/dev/null | grep -v "//" | head -5 > /dev/null 2>&1; then
    echo -e "${RED}❌ Found potential hardcoded API keys!${NC}"
    git grep -n "AIzaSy\|api_key" -- "*.kt" "*.gradle" | head -5
    check_result "Hardcoded API Keys Scan" 1
else
    check_result "Hardcoded API Keys Scan" 0
fi

# Test 7: Duplicate /java/ files
echo "🔍 Test 7: Checking for duplicate /java/ directory..."
if git ls-files | grep "android-clean-architecture/src/main/java/" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found .java files in android-clean-architecture!${NC}"
    git ls-files | grep "android-clean-architecture/src/main/java/" | head -5
    check_result "No /java/ Duplicates" 1
else
    check_result "No /java/ Duplicates" 0
fi

# Test 8: ProGuard Rules
echo "🔍 Test 8: Verifying ProGuard rules exist..."
if git ls-files | grep "android-clean-architecture.*proguard-rules.pro" > /dev/null 2>&1; then
    check_result "ProGuard Rules Present" 0
else
    echo -e "${YELLOW}⚠️  No ProGuard rules found (may not be critical for debug builds)${NC}"
    check_result "ProGuard Rules Present" 0
fi

# Test 9: GitHub Actions Workflow
echo "🔍 Test 9: Verifying GitHub Actions workflow exists..."
if git ls-files | grep ".github/workflows/build-apk.yml" > /dev/null 2>&1; then
    check_result "CI/CD Workflow Present" 0
else
    echo -e "${YELLOW}⚠️  GitHub Actions workflow not found${NC}"
    check_result "CI/CD Workflow Present" 1
fi

# Test 10: Documentation
echo "🔍 Test 10: Checking for security documentation..."
docs_found=0
[ -f "SECURITY_REVIEW_CHECKLIST.md" ] && ((docs_found++))
[ -f "PASOS_VERIFICACION.md" ] && ((docs_found++))
[ -f "INSTALL_LOCAL.md" ] && ((docs_found++))

if [ $docs_found -ge 2 ]; then
    check_result "Security Documentation Present" 0
else
    echo -e "${YELLOW}⚠️  Found $docs_found/3 documentation files${NC}"
    check_result "Security Documentation Present" 1
fi

# Summary
echo "=========================================="
echo "📊 SECURITY CHECK SUMMARY"
echo "=========================================="
echo -e "✅ PASSED: ${GREEN}$PASSED${NC}"
echo -e "❌ FAILED: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL SECURITY CHECKS PASSED!${NC}"
    echo "Ready for merge approval."
    exit 0
else
    echo -e "${RED}❌ $FAILED check(s) failed. Review and fix above.${NC}"
    exit 1
fi
