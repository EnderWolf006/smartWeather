import './App.css';
import './dark.css';
import { useEffect, useState } from 'react';
import { bitable, UIBuilder } from "@lark-base-open/js-sdk";
import callback from './main';
import { useTranslation } from 'react-i18next';
import './i18n'; // 取消注释以启用国际化

export default function App() {
  const translation = useTranslation();
  const [theme, setTheme] = useState<'LIGHT' | 'DARK'>('LIGHT');

      // 深色适配

      const applyTheme = (theme: 'LIGHT' | 'DARK') => {
        document.body.classList.toggle('dark-mode', theme === 'DARK');
      };
    
      useEffect(() => {
        const fetchTheme = async () => {
          try {
            const theme = await bitable.bridge.getTheme();
            setTheme(theme);
            applyTheme(theme);
          } catch (error) {
            console.error('获取主题时出错:', error);
          }
        };
    
        const onThemeChange = (event: { data: { theme: 'LIGHT' | 'DARK' } }) => {
          const newTheme = event.data.theme;
          setTheme(newTheme);
          applyTheme(newTheme);
        };
    
        fetchTheme();
    
        const unsubscribe = bitable.bridge.onThemeChange(onThemeChange);
    
        return () => unsubscribe();
      }, []);
  useEffect(() => {
    const uiBuilder = new UIBuilder(document.querySelector('#container') as HTMLElement, {
      bitable,
      callback,
      translation,
    });
    return () => {
      uiBuilder.unmount();
    };
  }, [translation]);
  return (
    <div id='container'></div>
  );
}

export const themeMode = 'systemtheme';