موقع خدمات مقر الندوة - نسخة فخمة

الملفات:
- index.html صفحة الخدمات مع قوائم منسدلة حسب نوع الخدمة
- admin.html لوحة الأدمن مع تنبيه فوري وإحصائيات
- config.js بيانات Supabase

قبل الرفع:
1) افتحي config.js
2) ضعي:
   window.SUPABASE_URL = "https://xxxx.supabase.co";
   window.SUPABASE_ANON_KEY = "مفتاح anon public أو publishable";
3) احفظي الملف
4) ارفعي المجلد كامل على Netlify مرة ثانية

مهم للتنبيه الفوري:
Supabase > Database > Replication/Realtime
فعلي Realtime لجدول requests2.

لوحة الأدمن:
رابط الموقع/admin.html
الدخول حسب جدول admins:
admin / 1234


تحديثات هذه النسخة:
- قائمة الغرف تعرض رقم الغرفة فقط بدون الموقع أو المبنى.
- دعم QR: الرابط ?room=101 يحدد الغرفة تلقائيًا.
- صفحة qrcodes.html تطبع QR لأول 4 غرف.

طريقة QR:
1) بعد رفع الموقع على Netlify افتحي: رابط_الموقع/qrcodes.html
2) اضغطي طباعة.
3) ضعي كل QR في الغرفة المناسبة.
