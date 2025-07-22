# 🔧 Configuración de GitHub Secrets para Deployment Automático

## Secrets necesarios para GitHub Actions

Para configurar el deployment automático, necesitas añadir los siguientes secrets en tu repositorio de GitHub:

### **1. Ir a la configuración de secrets:**

1. Ve a tu repositorio: https://github.com/tricoma035/Diani-Care
2. Haz clic en **Settings** (pestaña)
3. En el menú lateral, haz clic en **Secrets and variables** → **Actions**
4. Haz clic en **New repository secret**

### **2. Añadir los siguientes secrets:**

#### **VERCEL_TOKEN**

```
VPLweTAXsit6dTFM04LZA91f
```

#### **VERCEL_ORG_ID**

```
dtricoma-7904s-projects
```

#### **VERCEL_PROJECT_ID**

```
prj_pRJ7nzPzXRMfMPSd2I47sfF7CmXx
```

#### **NEXT_PUBLIC_SUPABASE_URL**

```
https://egdvzgrfhhicvsowshgx.supabase.co
```

#### **NEXT_PUBLIC_SUPABASE_ANON_KEY**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZHZ6Z3JmaGhpY3Zzb3dzaGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDIzNTcsImV4cCI6MjA2ODcxODM1N30.050qWydq8dnGY4WXDjfo5nhDU1821N3TwTbNAYW6t4Q
```

### **3. Verificar la configuración:**

Una vez configurados todos los secrets, cada vez que hagas push a la rama `main`, GitHub Actions:

1. ✅ Ejecutará el build automáticamente
2. ✅ Desplegará la aplicación en Vercel
3. ✅ Actualizará la URL de producción

### **4. URLs importantes:**

- **Repositorio**: https://github.com/tricoma035/Diani-Care
- **Actions**: https://github.com/tricoma035/Diani-Care/actions
- **Vercel Dashboard**: https://vercel.com/dtricoma-7904s-projects/diani-care
- **URL de producción**: https://diani-care-16w7je0t2-dtricoma-7904s-projects.vercel.app

### **5. Comandos útiles:**

```bash
# Ver logs de deployment
vercel logs

# Ver estado del proyecto
vercel project inspect

# Hacer deployment manual
vercel --prod
```
