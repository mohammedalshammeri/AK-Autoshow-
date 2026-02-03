import { readFileSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

// قائمة الملفات التي تحتوي على الشعار
const logoFiles = [
  'src/app/[locale]/HomePageClient.tsx',
  'src/app/[locale]/admin/page.tsx', 
  'src/app/[locale]/admin/page-fixed.tsx',
  'src/components/Preloader.tsx',
  'src/emails/DynamicApprovalEmail.tsx'
];

console.log('🔍 التحقق من أحجام الشعار الجديدة...\n');

logoFiles.forEach(file => {
  const filePath = join(projectRoot, file);
  
  try {
    const content = readFileSync(filePath, 'utf8');
    
    console.log(`📁 ${file}`);
    
    // البحث عن أحجام الشعار
    const logoMatches = content.match(/className="[^"]*h-\d+[^"]*"/g);
    const widthMatches = content.match(/width="\d+"/g);
    
    if (logoMatches) {
      logoMatches.forEach(match => {
        const sizeMatch = match.match(/h-(\d+)/);
        if (sizeMatch) {
          const size = parseInt(sizeMatch[1]) * 4; // تحويل من rem إلى px
          console.log(`  📏 حجم CSS: h-${sizeMatch[1]} = ${size}px`);
        }
      });
    }
    
    if (widthMatches) {
      widthMatches.forEach(match => {
        const widthMatch = match.match(/width="(\d+)"/);
        if (widthMatch) {
          console.log(`  📐 عرض مباشر: ${widthMatch[1]}px`);
        }
      });
    }
    
    if (!logoMatches && !widthMatches) {
      console.log('  ❌ لم يتم العثور على أحجام الشعار');
    }
    
    console.log(''); // سطر فارغ
    
  } catch (error) {
    console.log(`  ❌ خطأ في قراءة الملف: ${error.message}\n`);
  }
});

console.log('✅ اكتمل فحص أحجام الشعار');
console.log('\n📊 ملخص الأحجام المتوقعة:');
console.log('- هيدر الرئيسية: 64px (h-16)');
console.log('- فوتر الرئيسية: 80px (h-20)');  
console.log('- هيدر الإدارة: 64px (h-16)');
console.log('- تسجيل دخول الإدارة: 80px (h-20)');
console.log('- صفحة التحميل: 128px (h-32)');
console.log('- إيميل الموافقة: 250px (width="250")');
