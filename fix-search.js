// إصلاح دالة البحث - نسخة مبسطة وآمنة
const searchParticipants = async (query) => {
  if (!query.trim()) {
    setSearchResults([]);
    return;
  }

  setIsSearching(true);
  try {
    // البحث البسيط بدون الأعمدة المعقدة
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        car_images (
          id,
          image_url,
          created_at
        )
      `)
      .eq('status', 'approved')
      .ilike('full_name', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    // إذا لم نجد بالاسم، نبحث بالبريد الإلكتروني
    if (!data || data.length === 0) {
      const emailSearch = await supabase
        .from('registrations')
        .select(`
          *,
          car_images (
            id,
            image_url,
            created_at
          )
        `)
        .eq('status', 'approved')
        .ilike('email', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (emailSearch.data && emailSearch.data.length > 0) {
        setSearchResults(emailSearch.data);
        setIsSearching(false);
        return;
      }

      // البحث في معلومات السيارة
      const carSearch = await supabase
        .from('registrations')
        .select(`
          *,
          car_images (
            id,
            image_url,
            created_at
          )
        `)
        .eq('status', 'approved')
        .ilike('car_make', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      setSearchResults(carSearch.data || []);
    } else {
      setSearchResults(data);
    }

    console.log(`✅ تم العثور على ${data?.length || 0} مشارك`);

  } catch (error) {
    console.error('❌ خطأ عام في البحث:', error);
    alert(`خطأ في البحث: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
  } finally {
    setIsSearching(false);
  }
};
