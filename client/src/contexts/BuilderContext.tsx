import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { LandingPageData, Template, ContentFields, StyleConfig, Section } from '@shared/template-types';
import { DEFAULT_STYLE_CONFIG } from '@shared/template-types';

interface BuilderContextType {
  currentTemplate: Template | null;
  landingPageData: LandingPageData | null;
  selectTemplate: (template: Template) => void;
  updateContent: (content: Partial<ContentFields>) => void;
  updateStyles: (styles: Partial<StyleConfig>) => void;
  toggleSection: (sectionId: string) => void;
  resetBuilder: () => void;
  saveDraft: () => void;
  loadDraft: () => void;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

const STORAGE_KEY = 'landing-page-draft';

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [landingPageData, setLandingPageData] = useState<LandingPageData | null>(null);

  // Load draft from localStorage on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    if (landingPageData) {
      saveDraft();
    }
  }, [landingPageData]);

  const selectTemplate = (template: Template) => {
    setCurrentTemplate(template);
    setLandingPageData({
      templateId: template.id,
      content: { ...template.defaultContent },
      styles: { ...template.defaultStyles },
      sections: [...template.sections],
      lastModified: Date.now(),
    });
  };

  const updateContent = (content: Partial<ContentFields>) => {
    if (!landingPageData) return;
    setLandingPageData({
      ...landingPageData,
      content: { ...landingPageData.content, ...content },
      lastModified: Date.now(),
    });
  };

  const updateStyles = (styles: Partial<StyleConfig>) => {
    if (!landingPageData) return;
    setLandingPageData({
      ...landingPageData,
      styles: {
        ...landingPageData.styles,
        colors: { ...landingPageData.styles.colors, ...(styles.colors || {}) },
        fonts: { ...landingPageData.styles.fonts, ...(styles.fonts || {}) },
        ...(styles.spacing && { spacing: styles.spacing }),
        ...(styles.borderRadius && { borderRadius: styles.borderRadius }),
      },
      lastModified: Date.now(),
    });
  };

  const toggleSection = (sectionId: string) => {
    if (!landingPageData) return;
    setLandingPageData({
      ...landingPageData,
      sections: landingPageData.sections.map(section =>
        section.id === sectionId ? { ...section, visible: !section.visible } : section
      ),
      lastModified: Date.now(),
    });
  };

  const resetBuilder = () => {
    setCurrentTemplate(null);
    setLandingPageData(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const saveDraft = () => {
    if (landingPageData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(landingPageData));
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved) as LandingPageData;
        setLandingPageData(data);
        // Note: We don't restore currentTemplate here as it would require importing templates
        // The template will be set when user navigates to editor
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  return (
    <BuilderContext.Provider
      value={{
        currentTemplate,
        landingPageData,
        selectTemplate,
        updateContent,
        updateStyles,
        toggleSection,
        resetBuilder,
        saveDraft,
        loadDraft,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}
