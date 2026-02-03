import { access, constants } from 'fs/promises';
import { join } from 'path';

async function checkLogoFiles() {
  console.log('🔍 فحص ملفات الشعار...');
  
  const publicDir = join(process.cwd(), 'public');
  const oldLogo = join(publicDir, 'ak-autoshow-logo.jpg');
  const newLogo = join(publicDir, 'ak-autoshow-logo-new.png');
  
  try {
    // فحص الشعار القديم
    await access(oldLogo, constants.F_OK);
    console.log('✅ الشعار القديم موجود:', 'ak-autoshow-logo.jpg');
  } catch (error) {
    console.log('❌ الشعار القديم غير موجود:', 'ak-autoshow-logo.jpg');
  }
  
  try {
    // فحص الشعار الجديد
    await access(newLogo, constants.F_OK);
    console.log('✅ الشعار الجديد موجود:', 'ak-autoshow-logo-new.png');
  } catch (error) {
    console.log('❌ الشعار الجديد غير موجود:', 'ak-autoshow-logo-new.png');
  }
  
  console.log('🎉 تم فحص ملفات الشعار بنجاح');
}

checkLogoFiles().catch(console.error);
