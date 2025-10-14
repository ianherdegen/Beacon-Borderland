-- =====================================================
-- ADD FATE TEMPLATE TO EXISTING DATABASE
-- =====================================================
-- This script adds the Fate template as an exact clone of Territory Control (Versus type)
-- but with yellow styling in the UI

INSERT INTO game_templates (name, type, thumbnail, explainer_clip, created_date, description) VALUES
('Fate', 'Versus', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400', 'https://vimeo.com/789012345', '2024-02-20', 'Teams battle for control of key zones. Hold territories to earn points and secure victory through strategic positioning.');

-- The template will automatically appear in the UI with yellow styling
-- due to the code changes made to the React components
