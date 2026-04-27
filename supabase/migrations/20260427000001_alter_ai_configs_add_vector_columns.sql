alter table public.ai_configs
  add column bannable_words_vector_id        text null,
  add column bannable_words_vector_namespace text null,
  add column seo_vector_id                   text null,
  add column seo_vector_namespace            text null;
