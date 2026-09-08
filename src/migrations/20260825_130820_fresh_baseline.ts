import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_heading_level" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_pages_blocks_heading_size" AS ENUM('sm', 'md', 'lg', 'xl', 'display');
  CREATE TYPE "public"."enum_pages_blocks_heading_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_text_size" AS ENUM('sm', 'base', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_button_links_link_type" AS ENUM('reference', 'custom', 'enquiry', 'portalEnquiry');
  CREATE TYPE "public"."enum_pages_blocks_button_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_button_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_button_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_image_width" AS ENUM('full', 'wide', 'normal', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_image_rounded" AS ENUM('none', 'sm', 'md', 'full');
  CREATE TYPE "public"."enum_pages_blocks_image_shadow" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_image_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_spacer_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_divider_style" AS ENUM('line', 'dots', 'gradient');
  CREATE TYPE "public"."enum_pages_blocks_divider_width" AS ENUM('full', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_divider_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_icon_block_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_pages_blocks_icon_block_color" AS ENUM('primary', 'accent', 'muted', 'inherit');
  CREATE TYPE "public"."enum_pages_blocks_icon_block_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_faq_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_faq_columns" AS ENUM('1', '2', 'split');
  CREATE TYPE "public"."enum_pages_blocks_faq_item_style" AS ENUM('card', 'divided');
  CREATE TYPE "public"."enum_pages_blocks_faq_toggle_style" AS ENUM('plus', 'chevron', 'pill');
  CREATE TYPE "public"."enum_pages_blocks_faq_icon_style" AS ENUM('inline', 'tile');
  CREATE TYPE "public"."enum_pages_blocks_faq_density" AS ENUM('comfortable', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_faq_container_width" AS ENUM('narrow', 'normal', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_faq_rule_style" AS ENUM('light', 'grey', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_cards_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_cards_accent" AS ENUM('blue', 'steel', 'charcoal');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_cards_theme" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_cards_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_cards_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum_pages_blocks_gateway_cards_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_card_style" AS ENUM('card', 'plain', 'banded', 'soft', 'benefit');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_heading_weight" AS ENUM('default', 'heavy');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum_pages_blocks_feature_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_steps_badge_style" AS ENUM('plain', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_variant" AS ENUM('cards', 'two-row', 'claimant', 'edu-panels');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_number_style" AS ENUM('padded', 'plain');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_columns" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_items_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_taxonomy" AS ENUM('specialties', 'claim-types', 'areas-of-expertise', 'assessment-types');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_variant" AS ENUM('cards', 'checklist');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum_pages_blocks_specialty_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_footer_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_footer_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_header_background" AS ENUM('default', 'white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_source" AS ENUM('specialists', 'team', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_layout" AS ENUM('grid', 'carousel');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_carousel_options_direction" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum_pages_blocks_people_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_footer_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_category" AS ENUM('medico-legal', 'administrative', 'educational');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_service_group" AS ENUM('examination', 'reporting', 'administrative', 'education');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_layout" AS ENUM('grid', 'accordion');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_card_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum_pages_blocks_services_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_layout" AS ENUM('grid', 'carousel');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum_pages_blocks_stats_band_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_stats_band_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_stats_band_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_stats_band_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_aamle_education_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_aamle_education_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_aamle_education_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_aamle_education_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_rows_image_side" AS ENUM('auto', 'left', 'right');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_rows_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_row_style" AS ENUM('spaced', 'divided');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_density" AS ENUM('default', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_bullet_style" AS ENUM('check', 'dot');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_heading_weight" AS ENUM('default', 'heavy');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_split_feature_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_cta_band_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_tabs_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_tabs_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_tabs_tab_style" AS ENUM('pills', 'underline');
  CREATE TYPE "public"."enum_pages_blocks_tabs_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_tabs_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_callout_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_callout_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_callout_style" AS ENUM('info', 'note', 'good-to-know', 'reassurance', 'success', 'warning');
  CREATE TYPE "public"."enum_pages_blocks_contact_details_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_contact_details_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_contact_details_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_icon_list_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_icon_list_heading_align" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum_pages_blocks_icon_list_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum_pages_blocks_icon_list_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_icon_list_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_actions_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_actions_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_kind" AS ENUM('map', 'embed');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_aspect" AS ENUM('16-9', '4-3', '1-1', 'map');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_leadership_spotlight_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_leadership_spotlight_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_leadership_spotlight_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_leadership_spotlight_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_leadership_spotlight_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_portal_cta_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_video_embed_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_video_embed_provider" AS ENUM('youtube', 'vimeo', 'url');
  CREATE TYPE "public"."enum_pages_blocks_video_embed_aspect" AS ENUM('16:9', '4:3');
  CREATE TYPE "public"."enum_pages_blocks_video_embed_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_video_embed_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_video_embed_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_try_booking_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_try_booking_widget_type" AS ENUM('landingPageEmbed');
  CREATE TYPE "public"."enum_pages_blocks_try_booking_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_try_booking_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_try_booking_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_form_block_card_style" AS ENUM('none', 'card');
  CREATE TYPE "public"."enum_pages_blocks_row_columns_span" AS ENUM('auto', '1', '2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_row_columns_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_row_gap" AS ENUM('none', 'tight', 'normal', 'wide', 'x-wide');
  CREATE TYPE "public"."enum_pages_blocks_row_align_y" AS ENUM('top', 'center', 'bottom', 'stretch');
  CREATE TYPE "public"."enum_pages_blocks_row_column_ratio" AS ENUM('equal', '2-3', '3-2', '1-2', '2-1');
  CREATE TYPE "public"."enum_pages_blocks_section_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_section_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_section_padding_top" AS ENUM('none', 'compact', 'normal', 'spacious', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_section_padding_bottom" AS ENUM('none', 'compact', 'normal', 'spacious', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_section_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_section_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_archive_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_pages_blocks_archive_relation_to" AS ENUM('posts', 'events');
  CREATE TYPE "public"."enum_pages_blocks_archive_view" AS ENUM('upcoming', 'past');
  CREATE TYPE "public"."enum_pages_blocks_archive_post_style" AS ENUM('card', 'narrative');
  CREATE TYPE "public"."enum_pages_blocks_archive_event_style" AS ENUM('card', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_archive_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_archive_view_all_link_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_slide_carousel_slides_accent" AS ENUM('seminars', 'insights', 'networking', 'sponsorships');
  CREATE TYPE "public"."enum_pages_blocks_specialist_directory_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_specialist_directory_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_specialist_directory_sort_by" AS ENUM('order', 'lastName', 'firstName');
  CREATE TYPE "public"."enum_pages_blocks_specialty_directory_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_specialty_directory_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_variant" AS ENUM('card', 'ni-resource');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_audience" AS ENUM('clients', 'claimants', 'all');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_resource_type" AS ENUM('checklist', 'guide', 'template', 'fact-sheet');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum_pages_blocks_resources_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum_appt_guide_types_tabs_callout_style" AS ENUM('info', 'note', 'warning');
  CREATE TYPE "public"."enum_appt_guide_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_mission_pillars_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_mission_pillars_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_mission_pillars_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_mission_pillars_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_value_cards_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_value_cards_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_value_cards_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_value_cards_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_why_verify_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_why_verify_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_why_verify_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_pages_blocks_audience_pathways_pathways_variant" AS ENUM('client', 'claimant');
  CREATE TYPE "public"."enum_pages_blocks_audience_pathways_pathways_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_pages_blocks_audience_pathways_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_audience_pathways_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_audience_pathways_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_audience_pathways_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum_bkchooser_halves_links_link_type" AS ENUM('reference', 'custom', 'enquiry', 'portalEnquiry');
  CREATE TYPE "public"."enum_bkchooser_halves_accent" AS ENUM('blue', 'dark');
  CREATE TYPE "public"."enum_bkchooser_density" AS ENUM('default', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_cost_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_featured_articles_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_featured_articles_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_events_explorer_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_pages_blocks_events_explorer_mode" AS ENUM('all', 'upcoming-only', 'past-only');
  CREATE TYPE "public"."enum_pages_blocks_events_explorer_card_style" AS ENUM('list', 'card');
  CREATE TYPE "public"."enum_pages_blocks_events_explorer_separator_divider" AS ENUM('none', 'line', 'dots', 'gradient');
  CREATE TYPE "public"."enum_pages_blocks_events_explorer_separator_divider_width" AS ENUM('full', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_events_explorer_separator_past_background" AS ENUM('default', 'white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_blocks_events_explorer_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_hero_type" AS ENUM('none', 'pageHero', 'homeHero', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_pages_hero_theme" AS ENUM('light', 'dark', 'service');
  CREATE TYPE "public"."enum_pages_hero_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_hero_hero_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum_pages_hero_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_hero_hero_padding_top" AS ENUM('default', 'none', 'compact', 'normal', 'spacious', 'xl');
  CREATE TYPE "public"."enum_pages_hero_hero_padding_bottom" AS ENUM('default', 'none', 'compact', 'normal', 'spacious', 'xl');
  CREATE TYPE "public"."enum_pages_hero_definition_definition_style" AS ENUM('glow', 'frame');
  CREATE TYPE "public"."enum_pages_hero_definition_interaction" AS ENUM('full', 'subtle', 'off');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_level" AS ENUM('h1', 'h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_size" AS ENUM('sm', 'md', 'lg', 'xl', 'display');
  CREATE TYPE "public"."enum__pages_v_blocks_heading_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_text_size" AS ENUM('sm', 'base', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_text_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_button_links_link_type" AS ENUM('reference', 'custom', 'enquiry', 'portalEnquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_button_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_button_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_button_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_image_width" AS ENUM('full', 'wide', 'normal', 'narrow');
  CREATE TYPE "public"."enum__pages_v_blocks_image_rounded" AS ENUM('none', 'sm', 'md', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_image_shadow" AS ENUM('none', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_image_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_spacer_size" AS ENUM('xs', 'sm', 'md', 'lg', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_style" AS ENUM('line', 'dots', 'gradient');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_width" AS ENUM('full', 'narrow');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_block_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_block_color" AS ENUM('primary', 'accent', 'muted', 'inherit');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_block_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_columns" AS ENUM('1', '2', 'split');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_item_style" AS ENUM('card', 'divided');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_toggle_style" AS ENUM('plus', 'chevron', 'pill');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_icon_style" AS ENUM('inline', 'tile');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_density" AS ENUM('comfortable', 'compact');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_container_width" AS ENUM('narrow', 'normal', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_rule_style" AS ENUM('light', 'grey', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_accent" AS ENUM('blue', 'steel', 'charcoal');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_theme" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_gateway_cards_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_columns" AS ENUM('1', '2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_card_style" AS ENUM('card', 'plain', 'banded', 'soft', 'benefit');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_heading_weight" AS ENUM('default', 'heavy');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_steps_badge_style" AS ENUM('plain', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_variant" AS ENUM('cards', 'two-row', 'claimant', 'edu-panels');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_number_style" AS ENUM('padded', 'plain');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_columns" AS ENUM('1', '2', '3', '4', '5');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_items_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_taxonomy" AS ENUM('specialties', 'claim-types', 'areas-of-expertise', 'assessment-types');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_variant" AS ENUM('cards', 'checklist');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_footer_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_footer_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_header_background" AS ENUM('default', 'white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_source" AS ENUM('specialists', 'team', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_layout" AS ENUM('grid', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_carousel_options_direction" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_people_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_footer_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_category" AS ENUM('medico-legal', 'administrative', 'educational');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_service_group" AS ENUM('examination', 'reporting', 'administrative', 'education');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_layout" AS ENUM('grid', 'accordion');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_card_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_services_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_layout" AS ENUM('grid', 'carousel');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_band_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_band_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_band_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_stats_band_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_aamle_education_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_aamle_education_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_aamle_education_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_aamle_education_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_rows_image_side" AS ENUM('auto', 'left', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_rows_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_row_style" AS ENUM('spaced', 'divided');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_density" AS ENUM('default', 'compact');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_bullet_style" AS ENUM('check', 'dot');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_heading_weight" AS ENUM('default', 'heavy');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_split_feature_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_band_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_tab_style" AS ENUM('pills', 'underline');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_callout_style" AS ENUM('info', 'note', 'good-to-know', 'reassurance', 'success', 'warning');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_details_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_details_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_details_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_list_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_list_heading_align" AS ENUM('center', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_list_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_list_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_list_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_actions_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_actions_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_kind" AS ENUM('map', 'embed');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_aspect" AS ENUM('16-9', '4-3', '1-1', 'map');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_leadership_spotlight_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_leadership_spotlight_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_leadership_spotlight_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_leadership_spotlight_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_leadership_spotlight_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_portal_cta_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_video_embed_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_video_embed_provider" AS ENUM('youtube', 'vimeo', 'url');
  CREATE TYPE "public"."enum__pages_v_blocks_video_embed_aspect" AS ENUM('16:9', '4:3');
  CREATE TYPE "public"."enum__pages_v_blocks_video_embed_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_video_embed_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_video_embed_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_try_booking_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_try_booking_widget_type" AS ENUM('landingPageEmbed');
  CREATE TYPE "public"."enum__pages_v_blocks_try_booking_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_try_booking_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_try_booking_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_form_block_card_style" AS ENUM('none', 'card');
  CREATE TYPE "public"."enum__pages_v_blocks_row_columns_span" AS ENUM('auto', '1', '2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_row_columns_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_row_gap" AS ENUM('none', 'tight', 'normal', 'wide', 'x-wide');
  CREATE TYPE "public"."enum__pages_v_blocks_row_align_y" AS ENUM('top', 'center', 'bottom', 'stretch');
  CREATE TYPE "public"."enum__pages_v_blocks_row_column_ratio" AS ENUM('equal', '2-3', '3-2', '1-2', '2-1');
  CREATE TYPE "public"."enum__pages_v_blocks_section_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_section_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_section_padding_top" AS ENUM('none', 'compact', 'normal', 'spacious', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_section_padding_bottom" AS ENUM('none', 'compact', 'normal', 'spacious', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_section_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_section_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_relation_to" AS ENUM('posts', 'events');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_view" AS ENUM('upcoming', 'past');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_post_style" AS ENUM('card', 'narrative');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_event_style" AS ENUM('card', 'compact');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_view_all_link_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_slide_carousel_slides_accent" AS ENUM('seminars', 'insights', 'networking', 'sponsorships');
  CREATE TYPE "public"."enum__pages_v_blocks_specialist_directory_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_specialist_directory_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_specialist_directory_sort_by" AS ENUM('order', 'lastName', 'firstName');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_directory_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_specialty_directory_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_variant" AS ENUM('card', 'ni-resource');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_audience" AS ENUM('clients', 'claimants', 'all');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_resource_type" AS ENUM('checklist', 'guide', 'template', 'fact-sheet');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_hover_effect" AS ENUM('none', 'lift', 'glow', 'zoom', 'accent-bar');
  CREATE TYPE "public"."enum__pages_v_blocks_resources_grid_shadow" AS ENUM('default', 'none', 'xs', 'sm', 'md', 'lg', 'xl', 'glow', 'glow-strong');
  CREATE TYPE "public"."enum__appt_guide_v_types_tabs_callout_style" AS ENUM('info', 'note', 'warning');
  CREATE TYPE "public"."enum__appt_guide_v_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_mission_pillars_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_mission_pillars_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_mission_pillars_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_mission_pillars_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_value_cards_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_value_cards_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_value_cards_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_value_cards_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_why_verify_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_why_verify_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_why_verify_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__pages_v_blocks_audience_pathways_pathways_variant" AS ENUM('client', 'claimant');
  CREATE TYPE "public"."enum__pages_v_blocks_audience_pathways_pathways_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum__pages_v_blocks_audience_pathways_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_audience_pathways_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_audience_pathways_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_audience_pathways_motion" AS ENUM('none', 'fade-up', 'fade-in', 'zoom-in');
  CREATE TYPE "public"."enum__bkchooser_v_halves_links_link_type" AS ENUM('reference', 'custom', 'enquiry', 'portalEnquiry');
  CREATE TYPE "public"."enum__bkchooser_v_halves_accent" AS ENUM('blue', 'dark');
  CREATE TYPE "public"."enum__bkchooser_v_density" AS ENUM('default', 'compact');
  CREATE TYPE "public"."enum__pages_v_blocks_cost_grid_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_featured_articles_source" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_featured_articles_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_events_explorer_text_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_events_explorer_mode" AS ENUM('all', 'upcoming-only', 'past-only');
  CREATE TYPE "public"."enum__pages_v_blocks_events_explorer_card_style" AS ENUM('list', 'card');
  CREATE TYPE "public"."enum__pages_v_blocks_events_explorer_separator_divider" AS ENUM('none', 'line', 'dots', 'gradient');
  CREATE TYPE "public"."enum__pages_v_blocks_events_explorer_separator_divider_width" AS ENUM('full', 'narrow');
  CREATE TYPE "public"."enum__pages_v_blocks_events_explorer_separator_past_background" AS ENUM('default', 'white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_blocks_events_explorer_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_version_hero_type" AS ENUM('none', 'pageHero', 'homeHero', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__pages_v_version_hero_theme" AS ENUM('light', 'dark', 'service');
  CREATE TYPE "public"."enum__pages_v_version_hero_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_version_hero_hero_background" AS ENUM('white', 'muted', 'accent', 'accent-solid', 'light', 'primary', 'dark', 'hero');
  CREATE TYPE "public"."enum__pages_v_version_hero_container_width" AS ENUM('normal', 'narrow', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_version_hero_hero_padding_top" AS ENUM('default', 'none', 'compact', 'normal', 'spacious', 'xl');
  CREATE TYPE "public"."enum__pages_v_version_hero_hero_padding_bottom" AS ENUM('default', 'none', 'compact', 'normal', 'spacious', 'xl');
  CREATE TYPE "public"."enum__pages_v_version_hero_definition_definition_style" AS ENUM('glow', 'frame');
  CREATE TYPE "public"."enum__pages_v_version_hero_definition_interaction" AS ENUM('full', 'subtle', 'off');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_events_host" AS ENUM('aamle', 'verify');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_host" AS ENUM('aamle', 'verify');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_services_category" AS ENUM('medico-legal', 'administrative', 'educational');
  CREATE TYPE "public"."enum_services_service_group" AS ENUM('examination', 'reporting', 'administrative', 'education');
  CREATE TYPE "public"."enum_resources_resource_type" AS ENUM('checklist', 'guide', 'template', 'fact-sheet');
  CREATE TYPE "public"."enum_resources_audience" AS ENUM('clients', 'claimants', 'all');
  CREATE TYPE "public"."enum_specialists_profile_photo_shape" AS ENUM('tall', 'portrait', 'square');
  CREATE TYPE "public"."enum_specialists_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__specialists_v_version_profile_photo_shape" AS ENUM('tall', 'portrait', 'square');
  CREATE TYPE "public"."enum__specialists_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_team_profile_photo_shape" AS ENUM('tall', 'portrait', 'square');
  CREATE TYPE "public"."enum_team_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_v_version_profile_photo_shape" AS ENUM('tall', 'portrait', 'square');
  CREATE TYPE "public"."enum__team_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_availability_sessions_mode" AS ENUM('in-person', 'telehealth', 'either');
  CREATE TYPE "public"."enum_availability_sessions_status" AS ENUM('available', 'booked');
  CREATE TYPE "public"."enum_icons_colour" AS ENUM('inherit', 'brand', 'deep', 'linkblue', 'bright', 'definition', 'sky', 'muted', 'black', 'charcoal', 'grey', 'white', 'success', 'warning', 'error', 'heading', 'body');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_forms_confirmation_type" AS ENUM('message', 'redirect');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  CREATE TYPE "public"."enum_article_settings_sidebar_cards_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_header_nav_items_sub_items_sub_sub_items_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_header_nav_items_sub_items_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_header_nav_items_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_header_cta_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_footer_columns_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_footer_social_platform" AS ENUM('linkedin', 'facebook', 'instagram', 'x');
  CREATE TYPE "public"."enum_footer_legal_links_link_type" AS ENUM('reference', 'custom', 'enquiry');
  CREATE TYPE "public"."enum_design_system_typography_text_scale" AS ENUM('0.9', '0.95', '1', '1.05', '1.1', '1.15', '1.25');
  CREATE TABLE "pages_hero_meta_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"text" jsonb,
  	"href" varchar
  );
  
  CREATE TABLE "pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"level" "enum_pages_blocks_heading_level" DEFAULT 'h2',
  	"size" "enum_pages_blocks_heading_size" DEFAULT 'lg',
  	"align" "enum_pages_blocks_heading_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"size" "enum_pages_blocks_text_size" DEFAULT 'base',
  	"align" "enum_pages_blocks_text_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_button_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_button_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_blocks_button_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_button" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_button_size" DEFAULT 'md',
  	"align" "enum_pages_blocks_button_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"width" "enum_pages_blocks_image_width" DEFAULT 'full',
  	"rounded" "enum_pages_blocks_image_rounded" DEFAULT 'md',
  	"shadow" "enum_pages_blocks_image_shadow" DEFAULT 'none',
  	"align" "enum_pages_blocks_image_align" DEFAULT 'left',
  	"caption" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_spacer_size" DEFAULT 'md',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_pages_blocks_divider_style" DEFAULT 'line',
  	"width" "enum_pages_blocks_divider_width" DEFAULT 'full',
  	"align" "enum_pages_blocks_divider_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_icon_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"size" "enum_pages_blocks_icon_block_size" DEFAULT 'md',
  	"color" "enum_pages_blocks_icon_block_color" DEFAULT 'primary',
  	"align" "enum_pages_blocks_icon_block_align" DEFAULT 'left',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" jsonb,
  	"icon" varchar,
  	"image_id" integer,
  	"answer" jsonb,
  	"anchor_id" varchar
  );
  
  CREATE TABLE "pages_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_faq_text_colour" DEFAULT 'inherit',
  	"columns" "enum_pages_blocks_faq_columns" DEFAULT '1',
  	"item_style" "enum_pages_blocks_faq_item_style",
  	"toggle_style" "enum_pages_blocks_faq_toggle_style",
  	"icon_style" "enum_pages_blocks_faq_icon_style",
  	"density" "enum_pages_blocks_faq_density",
  	"container_width" "enum_pages_blocks_faq_container_width",
  	"rule_style" "enum_pages_blocks_faq_rule_style",
  	"exclusive" boolean,
  	"open_first" boolean,
  	"help_card_heading" jsonb,
  	"help_card_body" jsonb,
  	"help_card_email" varchar,
  	"help_card_phone" varchar,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_gateway_cards_cards_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_gateway_cards_cards_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "pages_blocks_gateway_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"eyebrow" jsonb,
  	"subtitle" jsonb,
  	"title" jsonb,
  	"description" jsonb,
  	"accent" "enum_pages_blocks_gateway_cards_cards_accent" DEFAULT 'blue',
  	"theme" "enum_pages_blocks_gateway_cards_cards_theme" DEFAULT 'light',
  	"link_type" "enum_pages_blocks_gateway_cards_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_blocks_gateway_cards_cards_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_gateway_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_gateway_cards_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_gateway_cards_background" DEFAULT 'white',
  	"columns" "enum_pages_blocks_gateway_cards_columns" DEFAULT '3',
  	"container_width" "enum_pages_blocks_gateway_cards_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_gateway_cards_motion" DEFAULT 'none',
  	"hover_effect" "enum_pages_blocks_gateway_cards_hover_effect" DEFAULT 'lift',
  	"shadow" "enum_pages_blocks_gateway_cards_shadow" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid_items_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb
  );
  
  CREATE TABLE "pages_blocks_feature_grid_items_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"description" jsonb
  );
  
  CREATE TABLE "pages_blocks_feature_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"title_suffix" jsonb,
  	"description" jsonb,
  	"details_label" jsonb
  );
  
  CREATE TABLE "pages_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_feature_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_feature_grid_background" DEFAULT 'white',
  	"columns" "enum_pages_blocks_feature_grid_columns" DEFAULT '3',
  	"card_style" "enum_pages_blocks_feature_grid_card_style" DEFAULT 'card',
  	"heading_weight" "enum_pages_blocks_feature_grid_heading_weight" DEFAULT 'default',
  	"container_width" "enum_pages_blocks_feature_grid_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_feature_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum_pages_blocks_feature_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum_pages_blocks_feature_grid_shadow" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_process_steps_steps_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb
  );
  
  CREATE TABLE "pages_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"badge" jsonb,
  	"badge_style" "enum_pages_blocks_process_steps_steps_badge_style" DEFAULT 'plain',
  	"title" jsonb,
  	"description" jsonb
  );
  
  CREATE TABLE "pages_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_process_steps_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_process_steps_background" DEFAULT 'white',
  	"variant" "enum_pages_blocks_process_steps_variant" DEFAULT 'cards',
  	"number_style" "enum_pages_blocks_process_steps_number_style" DEFAULT 'padded',
  	"intro_rich" jsonb,
  	"image_id" integer,
  	"image_placeholder" boolean DEFAULT false,
  	"placeholder_label" jsonb,
  	"placeholder_icon" varchar,
  	"columns" "enum_pages_blocks_process_steps_columns" DEFAULT '3',
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_process_steps_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_process_steps_motion" DEFAULT 'none',
  	"hover_effect" "enum_pages_blocks_process_steps_hover_effect" DEFAULT 'lift',
  	"shadow" "enum_pages_blocks_process_steps_shadow" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_specialty_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"link_type" "enum_pages_blocks_specialty_grid_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "pages_blocks_specialty_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_specialty_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_specialty_grid_background" DEFAULT 'white',
  	"source" "enum_pages_blocks_specialty_grid_source" DEFAULT 'auto',
  	"taxonomy" "enum_pages_blocks_specialty_grid_taxonomy" DEFAULT 'specialties',
  	"variant" "enum_pages_blocks_specialty_grid_variant" DEFAULT 'cards',
  	"columns" "enum_pages_blocks_specialty_grid_columns" DEFAULT '4',
  	"default_icon" varchar DEFAULT 'stethoscope',
  	"link_to_directory" boolean,
  	"directory_path" varchar DEFAULT '/specialists/specialist-panel',
  	"cta_label" jsonb,
  	"container_width" "enum_pages_blocks_specialty_grid_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_specialty_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum_pages_blocks_specialty_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum_pages_blocks_specialty_grid_shadow" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_people_grid_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_people_grid_footer_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_blocks_people_grid_footer_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_people_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_people_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_people_grid_background" DEFAULT 'white',
  	"header_background" "enum_pages_blocks_people_grid_header_background" DEFAULT 'default',
  	"source" "enum_pages_blocks_people_grid_source" DEFAULT 'specialists',
  	"only_advertised" boolean,
  	"featured_only" boolean,
  	"specialty_id" integer,
  	"location_id" integer,
  	"asmt_type_id" integer,
  	"department_id" integer,
  	"group_by_department" boolean,
  	"layout" "enum_pages_blocks_people_grid_layout" DEFAULT 'grid',
  	"columns" "enum_pages_blocks_people_grid_columns" DEFAULT '4',
  	"limit" numeric DEFAULT 8,
  	"link_profiles" boolean,
  	"carousel_options_speed" numeric DEFAULT 60,
  	"carousel_options_direction" "enum_pages_blocks_people_grid_carousel_options_direction" DEFAULT 'left',
  	"carousel_options_show_arrows" boolean DEFAULT true,
  	"container_width" "enum_pages_blocks_people_grid_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_people_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum_pages_blocks_people_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum_pages_blocks_people_grid_shadow" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_services_grid_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_services_grid_footer_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "pages_blocks_services_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_services_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_services_grid_background" DEFAULT 'white',
  	"source" "enum_pages_blocks_services_grid_source" DEFAULT 'auto',
  	"category" "enum_pages_blocks_services_grid_category",
  	"service_group" "enum_pages_blocks_services_grid_service_group",
  	"layout" "enum_pages_blocks_services_grid_layout" DEFAULT 'grid',
  	"columns" "enum_pages_blocks_services_grid_columns" DEFAULT '3',
  	"limit" numeric DEFAULT 12,
  	"link_to_service" boolean,
  	"show_enquire" boolean,
  	"hide_description" boolean,
  	"card_align" "enum_pages_blocks_services_grid_card_align" DEFAULT 'left',
  	"service_path_prefix" varchar DEFAULT '/services',
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_services_grid_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_services_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum_pages_blocks_services_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum_pages_blocks_services_grid_shadow" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_testimonials_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_testimonials_grid_background" DEFAULT 'white',
  	"source" "enum_pages_blocks_testimonials_grid_source" DEFAULT 'auto',
  	"featured_only" boolean,
  	"layout" "enum_pages_blocks_testimonials_grid_layout" DEFAULT 'grid',
  	"columns" "enum_pages_blocks_testimonials_grid_columns" DEFAULT '3',
  	"limit" numeric DEFAULT 6,
  	"carousel_options_visible" numeric DEFAULT 1,
  	"carousel_options_show_arrows" boolean DEFAULT true,
  	"container_width" "enum_pages_blocks_testimonials_grid_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_testimonials_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum_pages_blocks_testimonials_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum_pages_blocks_testimonials_grid_shadow" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_stats_band_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"prefix" jsonb,
  	"suffix" jsonb,
  	"label" jsonb
  );
  
  CREATE TABLE "pages_blocks_stats_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_stats_band_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_stats_band_background" DEFAULT 'primary',
  	"container_width" "enum_pages_blocks_stats_band_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_stats_band_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_aamle_education_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb
  );
  
  CREATE TABLE "pages_blocks_aamle_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_aamle_education_background" DEFAULT 'white',
  	"eyebrow" jsonb,
  	"wordmark" jsonb,
  	"subheading" jsonb,
  	"badge_icon" varchar DEFAULT 'graduation-cap',
  	"badge_text" jsonb,
  	"description" jsonb,
  	"link_type" "enum_pages_blocks_aamle_education_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"image_id" integer,
  	"image_placeholder" boolean DEFAULT true,
  	"placeholder_label" jsonb,
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_aamle_education_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_aamle_education_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_split_feature_rows_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"icon" varchar
  );
  
  CREATE TABLE "pages_blocks_split_feature_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_placeholder" boolean,
  	"placeholder_label" jsonb,
  	"placeholder_icon" varchar,
  	"image_side" "enum_pages_blocks_split_feature_rows_image_side" DEFAULT 'auto',
  	"eyebrow" jsonb,
  	"icon" varchar,
  	"title" jsonb,
  	"body" jsonb,
  	"bullets_label" jsonb,
  	"link_type" "enum_pages_blocks_split_feature_rows_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"anchor_id" varchar
  );
  
  CREATE TABLE "pages_blocks_split_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_split_feature_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_split_feature_background" DEFAULT 'white',
  	"row_style" "enum_pages_blocks_split_feature_row_style" DEFAULT 'spaced',
  	"density" "enum_pages_blocks_split_feature_density" DEFAULT 'default',
  	"bullet_style" "enum_pages_blocks_split_feature_bullet_style" DEFAULT 'check',
  	"heading_weight" "enum_pages_blocks_split_feature_heading_weight" DEFAULT 'default',
  	"container_width" "enum_pages_blocks_split_feature_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_split_feature_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_blocks_cta_band_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"text" jsonb,
  	"container_width" "enum_pages_blocks_cta_band_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_cta_band_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" jsonb,
  	"icon" varchar
  );
  
  CREATE TABLE "pages_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_tabs_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_tabs_background" DEFAULT 'white',
  	"tab_style" "enum_pages_blocks_tabs_tab_style" DEFAULT 'pills',
  	"default_tab" numeric DEFAULT 0,
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_tabs_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_tabs_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_callout_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_callout_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_blocks_callout_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"style" "enum_pages_blocks_callout_style" DEFAULT 'info',
  	"icon" varchar,
  	"tag" jsonb,
  	"heading" jsonb,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_details_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"value" jsonb,
  	"href" varchar,
  	"note" jsonb
  );
  
  CREATE TABLE "pages_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_contact_details_text_colour" DEFAULT 'inherit',
  	"use_global" boolean DEFAULT true,
  	"container_width" "enum_pages_blocks_contact_details_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_contact_details_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_icon_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"text" jsonb,
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_blocks_icon_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_icon_list_text_colour" DEFAULT 'inherit',
  	"heading_align" "enum_pages_blocks_icon_list_heading_align",
  	"columns" "enum_pages_blocks_icon_list_columns" DEFAULT '1',
  	"container_width" "enum_pages_blocks_icon_list_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_icon_list_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_map_embed_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_map_embed_actions_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum_pages_blocks_map_embed_actions_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_map_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_map_embed_text_colour" DEFAULT 'inherit',
  	"kind" "enum_pages_blocks_map_embed_kind" DEFAULT 'map',
  	"office_id" integer,
  	"embed_url" varchar,
  	"aspect" "enum_pages_blocks_map_embed_aspect" DEFAULT '16-9',
  	"title" varchar,
  	"show_office_info" boolean DEFAULT true,
  	"office_hours_heading" jsonb,
  	"transport_heading" jsonb,
  	"parking_heading" jsonb,
  	"container_width" "enum_pages_blocks_map_embed_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_map_embed_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_leadership_spotlight_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"cred" jsonb
  );
  
  CREATE TABLE "pages_blocks_leadership_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_leadership_spotlight_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_leadership_spotlight_background" DEFAULT 'muted',
  	"photo_id" integer,
  	"placeholder_icon" varchar DEFAULT 'user-circle',
  	"name" jsonb,
  	"role" jsonb,
  	"badge" jsonb,
  	"tagline" jsonb,
  	"body" jsonb,
  	"link_type" "enum_pages_blocks_leadership_spotlight_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"container_width" "enum_pages_blocks_leadership_spotlight_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_leadership_spotlight_motion" DEFAULT 'none',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_portal_cta_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb
  );
  
  CREATE TABLE "pages_blocks_portal_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_portal_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "pages_blocks_portal_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_video_embed_text_colour" DEFAULT 'inherit',
  	"provider" "enum_pages_blocks_video_embed_provider" DEFAULT 'youtube',
  	"aspect" "enum_pages_blocks_video_embed_aspect" DEFAULT '16:9',
  	"video_id" varchar,
  	"url" varchar,
  	"video_title" varchar,
  	"caption" jsonb,
  	"background" "enum_pages_blocks_video_embed_background" DEFAULT 'white',
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_video_embed_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_video_embed_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_try_booking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_try_booking_text_colour" DEFAULT 'inherit',
  	"event_id" varchar,
  	"widget_type" "enum_pages_blocks_try_booking_widget_type" DEFAULT 'landingPageEmbed',
  	"fallback_label" jsonb,
  	"background" "enum_pages_blocks_try_booking_background" DEFAULT 'white',
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_try_booking_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_try_booking_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"card_style" "enum_pages_blocks_form_block_card_style",
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_row_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"span" "enum_pages_blocks_row_columns_span" DEFAULT 'auto',
  	"align" "enum_pages_blocks_row_columns_align" DEFAULT 'left'
  );
  
  CREATE TABLE "pages_blocks_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"gap" "enum_pages_blocks_row_gap" DEFAULT 'normal',
  	"align_y" "enum_pages_blocks_row_align_y" DEFAULT 'stretch',
  	"column_ratio" "enum_pages_blocks_row_column_ratio",
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_section_background" DEFAULT 'white',
  	"container_width" "enum_pages_blocks_section_container_width" DEFAULT 'normal',
  	"padding_top" "enum_pages_blocks_section_padding_top" DEFAULT 'normal',
  	"padding_bottom" "enum_pages_blocks_section_padding_bottom" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_section_motion" DEFAULT 'none',
  	"align" "enum_pages_blocks_section_align" DEFAULT 'left',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_archive_background" DEFAULT 'white',
  	"intro_content" jsonb,
  	"populate_by" "enum_pages_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_pages_blocks_archive_relation_to" DEFAULT 'posts',
  	"view" "enum_pages_blocks_archive_view" DEFAULT 'upcoming',
  	"stream_id" integer,
  	"featured" boolean DEFAULT false,
  	"post_style" "enum_pages_blocks_archive_post_style" DEFAULT 'card',
  	"event_style" "enum_pages_blocks_archive_event_style" DEFAULT 'card',
  	"limit" numeric DEFAULT 10,
  	"columns" "enum_pages_blocks_archive_columns" DEFAULT '3',
  	"read_more_label" jsonb,
  	"view_all_link_link_type" "enum_pages_blocks_archive_view_all_link_link_type" DEFAULT 'reference',
  	"view_all_link_link_new_tab" boolean,
  	"view_all_link_link_url" varchar,
  	"view_all_link_link_label" jsonb,
  	"view_all_link_link_anchor" varchar,
  	"view_all_link_link_icon" varchar,
  	"anchor_id" varchar,
  	"hide_when_empty" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_availability" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"show_carousel" boolean DEFAULT true,
  	"show_legend" boolean DEFAULT true,
  	"show_specialty_badge" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_slide_carousel_slides_pills" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb
  );
  
  CREATE TABLE "pages_blocks_slide_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" jsonb,
  	"body" jsonb,
  	"accent" "enum_pages_blocks_slide_carousel_slides_accent" DEFAULT 'seminars',
  	"visual_label" jsonb,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_slide_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"autoplay" boolean DEFAULT true,
  	"interval" numeric DEFAULT 5800,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_specialist_directory" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_specialist_directory_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_specialist_directory_background" DEFAULT 'white',
  	"enable_search" boolean DEFAULT true,
  	"enable_specialty" boolean DEFAULT true,
  	"enable_location" boolean DEFAULT true,
  	"enable_accreditation" boolean DEFAULT true,
  	"sort_by" "enum_pages_blocks_specialist_directory_sort_by" DEFAULT 'order',
  	"search_placeholder" varchar DEFAULT 'Search by name…',
  	"count_template" varchar DEFAULT '{count} specialists',
  	"search_group_label" varchar DEFAULT 'Search',
  	"specialty_group_label" varchar DEFAULT 'Filter by specialty',
  	"accreditation_group_label" varchar DEFAULT 'Filter by accreditation',
  	"location_group_label" varchar DEFAULT 'Filter by location',
  	"specialty_label" varchar DEFAULT 'Specialty',
  	"location_label" varchar DEFAULT 'Location',
  	"accreditation_label" varchar DEFAULT 'Accreditation',
  	"empty_heading" jsonb,
  	"empty_body" jsonb,
  	"card_cta_label" varchar DEFAULT 'View Profile',
  	"secondary_cta_label" varchar DEFAULT 'Request Availability',
  	"secondary_cta_href" varchar DEFAULT '/contact',
  	"reset_label" varchar DEFAULT 'Clear Filters',
  	"locations_label" varchar DEFAULT 'Consulting Locations',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_specialty_directory" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_specialty_directory_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_specialty_directory_background" DEFAULT 'white',
  	"show_filter_bar" boolean DEFAULT true,
  	"show_rosters" boolean DEFAULT true,
  	"show_key_areas" boolean DEFAULT true,
  	"all_tab_label" jsonb,
  	"empty_label" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_resources_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_resources_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_resources_grid_background" DEFAULT 'white',
  	"source" "enum_pages_blocks_resources_grid_source" DEFAULT 'auto',
  	"variant" "enum_pages_blocks_resources_grid_variant" DEFAULT 'card',
  	"audience" "enum_pages_blocks_resources_grid_audience",
  	"resource_type" "enum_pages_blocks_resources_grid_resource_type",
  	"columns" "enum_pages_blocks_resources_grid_columns" DEFAULT '3',
  	"limit" numeric DEFAULT 12,
  	"anchor_id" varchar,
  	"hide_when_empty" boolean DEFAULT false,
  	"container_width" "enum_pages_blocks_resources_grid_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_resources_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum_pages_blocks_resources_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum_pages_blocks_resources_grid_shadow" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "appt_guide_types_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"heading" jsonb,
  	"body" jsonb
  );
  
  CREATE TABLE "hcards_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb
  );
  
  CREATE TABLE "hcards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb
  );
  
  CREATE TABLE "appt_guide_types_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"callout_style" "enum_appt_guide_types_tabs_callout_style" DEFAULT 'info',
  	"callout_text" jsonb
  );
  
  CREATE TABLE "appt_guide_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"sublabel" jsonb,
  	"anchor_id" varchar
  );
  
  CREATE TABLE "appt_guide" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_appt_guide_text_colour" DEFAULT 'inherit',
  	"select_label" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_mission_pillars_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" jsonb
  );
  
  CREATE TABLE "pages_blocks_mission_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"background" "enum_pages_blocks_mission_pillars_background" DEFAULT 'hero',
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_mission_pillars_text_colour" DEFAULT 'inherit',
  	"container_width" "enum_pages_blocks_mission_pillars_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_mission_pillars_motion" DEFAULT 'none',
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_value_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" jsonb,
  	"description" jsonb
  );
  
  CREATE TABLE "pages_blocks_value_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_value_cards_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_value_cards_background" DEFAULT 'dark',
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_value_cards_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_value_cards_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_why_verify_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"body" jsonb
  );
  
  CREATE TABLE "pages_blocks_why_verify" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_why_verify_text_colour" DEFAULT 'inherit',
  	"image_id" integer,
  	"placeholder_label" jsonb,
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_why_verify_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_why_verify_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_audience_pathways_pathways_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" jsonb,
  	"description" jsonb
  );
  
  CREATE TABLE "pages_blocks_audience_pathways_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_audience_pathways_pathways_variant" DEFAULT 'client',
  	"eyebrow" jsonb,
  	"title" jsonb,
  	"description" jsonb,
  	"link_type" "enum_pages_blocks_audience_pathways_pathways_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "pages_blocks_audience_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_audience_pathways_text_colour" DEFAULT 'inherit',
  	"background" "enum_pages_blocks_audience_pathways_background" DEFAULT 'white',
  	"anchor_id" varchar,
  	"container_width" "enum_pages_blocks_audience_pathways_container_width" DEFAULT 'normal',
  	"motion" "enum_pages_blocks_audience_pathways_motion" DEFAULT 'none',
  	"block_name" varchar
  );
  
  CREATE TABLE "bkchooser_halves_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_bkchooser_halves_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "bkchooser_halves" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"accent" "enum_bkchooser_halves_accent" DEFAULT 'blue',
  	"eyebrow" jsonb,
  	"title" jsonb,
  	"description" jsonb
  );
  
  CREATE TABLE "bkchooser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"density" "enum_bkchooser_density" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cost_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"description" jsonb
  );
  
  CREATE TABLE "pages_blocks_cost_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_cost_grid_text_colour" DEFAULT 'inherit',
  	"note" jsonb,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"placeholder" varchar DEFAULT 'Enter your email',
  	"button_label" jsonb,
  	"note" jsonb,
  	"anchor_id" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_section_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"anchor_id" varchar
  );
  
  CREATE TABLE "pages_blocks_section_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sticky" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_featured_articles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"autoplay" boolean DEFAULT true,
  	"interval" numeric DEFAULT 5000,
  	"show_arrows" boolean DEFAULT true,
  	"show_dots" boolean DEFAULT true,
  	"source" "enum_pages_blocks_featured_articles_source" DEFAULT 'auto',
  	"limit" numeric DEFAULT 6,
  	"badge_label" jsonb,
  	"byline_prefix" jsonb,
  	"cta_label" jsonb,
  	"anchor_id" varchar,
  	"background" "enum_pages_blocks_featured_articles_background" DEFAULT 'white',
  	"hide_when_empty" boolean DEFAULT false,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_events_explorer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum_pages_blocks_events_explorer_text_colour" DEFAULT 'inherit',
  	"mode" "enum_pages_blocks_events_explorer_mode" DEFAULT 'all',
  	"page_size" numeric DEFAULT 8,
  	"show_search" boolean DEFAULT true,
  	"card_style" "enum_pages_blocks_events_explorer_card_style" DEFAULT 'list',
  	"groups_upcoming_eyebrow" jsonb,
  	"groups_upcoming_heading" varchar,
  	"groups_upcoming_intro" jsonb,
  	"groups_upcoming_link_label" jsonb,
  	"groups_upcoming_link_url" varchar,
  	"groups_past_eyebrow" jsonb,
  	"groups_past_heading" varchar,
  	"groups_past_intro" jsonb,
  	"groups_past_link_label" jsonb,
  	"groups_past_link_url" varchar,
  	"separator_divider" "enum_pages_blocks_events_explorer_separator_divider" DEFAULT 'none',
  	"separator_divider_width" "enum_pages_blocks_events_explorer_separator_divider_width" DEFAULT 'full',
  	"separator_past_background" "enum_pages_blocks_events_explorer_separator_past_background" DEFAULT 'default',
  	"labels_more_info_label" varchar,
  	"labels_view_recap_label" varchar,
  	"labels_upcoming_heading" varchar,
  	"labels_past_heading" varchar,
  	"labels_empty_upcoming" varchar,
  	"labels_empty_upcoming_search" varchar,
  	"labels_empty_past" varchar,
  	"labels_empty_past_search" varchar,
  	"labels_loading_label" varchar,
  	"labels_search_placeholder" varchar,
  	"labels_dates_label" varchar,
  	"labels_search_button_label" varchar,
  	"anchor_id" varchar,
  	"background" "enum_pages_blocks_events_explorer_background" DEFAULT 'white',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_pages_hero_type" DEFAULT 'pageHero',
  	"hero_eyebrow" jsonb,
  	"hero_heading" jsonb,
  	"hero_subtitle" jsonb,
  	"hero_show_breadcrumb" boolean DEFAULT true,
  	"hero_theme" "enum_pages_hero_theme" DEFAULT 'light',
  	"hero_align" "enum_pages_hero_align" DEFAULT 'left',
  	"hero_show_shield" boolean,
  	"hero_image_panel" boolean,
  	"hero_image_panel_label" jsonb,
  	"hero_hero_background" "enum_pages_hero_hero_background" DEFAULT 'accent-solid',
  	"hero_container_width" "enum_pages_hero_container_width" DEFAULT 'normal',
  	"hero_hero_padding_top" "enum_pages_hero_hero_padding_top" DEFAULT 'default',
  	"hero_hero_padding_bottom" "enum_pages_hero_hero_padding_bottom" DEFAULT 'default',
  	"hero_definition_term" jsonb,
  	"hero_definition_pronunciation" jsonb,
  	"hero_definition_text" jsonb,
  	"hero_definition_definition_style" "enum_pages_hero_definition_definition_style" DEFAULT 'glow',
  	"hero_definition_interaction" "enum_pages_hero_definition_interaction" DEFAULT 'full',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"specialists_id" integer,
  	"team_id" integer,
  	"events_id" integer,
  	"services_id" integer,
  	"testimonials_id" integer,
  	"categories_id" integer,
  	"resources_id" integer
  );
  
  CREATE TABLE "_pages_v_version_hero_meta_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"text" jsonb,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_heading" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"level" "enum__pages_v_blocks_heading_level" DEFAULT 'h2',
  	"size" "enum__pages_v_blocks_heading_size" DEFAULT 'lg',
  	"align" "enum__pages_v_blocks_heading_align" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"size" "enum__pages_v_blocks_text_size" DEFAULT 'base',
  	"align" "enum__pages_v_blocks_text_align" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_button_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_button_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_blocks_button_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_button" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_button_size" DEFAULT 'md',
  	"align" "enum__pages_v_blocks_button_align" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"width" "enum__pages_v_blocks_image_width" DEFAULT 'full',
  	"rounded" "enum__pages_v_blocks_image_rounded" DEFAULT 'md',
  	"shadow" "enum__pages_v_blocks_image_shadow" DEFAULT 'none',
  	"align" "enum__pages_v_blocks_image_align" DEFAULT 'left',
  	"caption" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_spacer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_spacer_size" DEFAULT 'md',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__pages_v_blocks_divider_style" DEFAULT 'line',
  	"width" "enum__pages_v_blocks_divider_width" DEFAULT 'full',
  	"align" "enum__pages_v_blocks_divider_align" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_icon_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"size" "enum__pages_v_blocks_icon_block_size" DEFAULT 'md',
  	"color" "enum__pages_v_blocks_icon_block_color" DEFAULT 'primary',
  	"align" "enum__pages_v_blocks_icon_block_align" DEFAULT 'left',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" jsonb,
  	"icon" varchar,
  	"image_id" integer,
  	"answer" jsonb,
  	"anchor_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_faq_text_colour" DEFAULT 'inherit',
  	"columns" "enum__pages_v_blocks_faq_columns" DEFAULT '1',
  	"item_style" "enum__pages_v_blocks_faq_item_style",
  	"toggle_style" "enum__pages_v_blocks_faq_toggle_style",
  	"icon_style" "enum__pages_v_blocks_faq_icon_style",
  	"density" "enum__pages_v_blocks_faq_density",
  	"container_width" "enum__pages_v_blocks_faq_container_width",
  	"rule_style" "enum__pages_v_blocks_faq_rule_style",
  	"exclusive" boolean,
  	"open_first" boolean,
  	"help_card_heading" jsonb,
  	"help_card_body" jsonb,
  	"help_card_email" varchar,
  	"help_card_phone" varchar,
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gateway_cards_cards_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_gateway_cards_cards_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gateway_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"eyebrow" jsonb,
  	"subtitle" jsonb,
  	"title" jsonb,
  	"description" jsonb,
  	"accent" "enum__pages_v_blocks_gateway_cards_cards_accent" DEFAULT 'blue',
  	"theme" "enum__pages_v_blocks_gateway_cards_cards_theme" DEFAULT 'light',
  	"link_type" "enum__pages_v_blocks_gateway_cards_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_blocks_gateway_cards_cards_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_gateway_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_gateway_cards_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_gateway_cards_background" DEFAULT 'white',
  	"columns" "enum__pages_v_blocks_gateway_cards_columns" DEFAULT '3',
  	"container_width" "enum__pages_v_blocks_gateway_cards_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_gateway_cards_motion" DEFAULT 'none',
  	"hover_effect" "enum__pages_v_blocks_gateway_cards_hover_effect" DEFAULT 'lift',
  	"shadow" "enum__pages_v_blocks_gateway_cards_shadow" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid_items_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid_items_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"title_suffix" jsonb,
  	"description" jsonb,
  	"details_label" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_feature_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_feature_grid_background" DEFAULT 'white',
  	"columns" "enum__pages_v_blocks_feature_grid_columns" DEFAULT '3',
  	"card_style" "enum__pages_v_blocks_feature_grid_card_style" DEFAULT 'card',
  	"heading_weight" "enum__pages_v_blocks_feature_grid_heading_weight" DEFAULT 'default',
  	"container_width" "enum__pages_v_blocks_feature_grid_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_feature_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum__pages_v_blocks_feature_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum__pages_v_blocks_feature_grid_shadow" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_steps_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"badge" jsonb,
  	"badge_style" "enum__pages_v_blocks_process_steps_steps_badge_style" DEFAULT 'plain',
  	"title" jsonb,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_process_steps_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_process_steps_background" DEFAULT 'white',
  	"variant" "enum__pages_v_blocks_process_steps_variant" DEFAULT 'cards',
  	"number_style" "enum__pages_v_blocks_process_steps_number_style" DEFAULT 'padded',
  	"intro_rich" jsonb,
  	"image_id" integer,
  	"image_placeholder" boolean DEFAULT false,
  	"placeholder_label" jsonb,
  	"placeholder_icon" varchar,
  	"columns" "enum__pages_v_blocks_process_steps_columns" DEFAULT '3',
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_process_steps_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_process_steps_motion" DEFAULT 'none',
  	"hover_effect" "enum__pages_v_blocks_process_steps_hover_effect" DEFAULT 'lift',
  	"shadow" "enum__pages_v_blocks_process_steps_shadow" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_specialty_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"link_type" "enum__pages_v_blocks_specialty_grid_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_specialty_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_specialty_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_specialty_grid_background" DEFAULT 'white',
  	"source" "enum__pages_v_blocks_specialty_grid_source" DEFAULT 'auto',
  	"taxonomy" "enum__pages_v_blocks_specialty_grid_taxonomy" DEFAULT 'specialties',
  	"variant" "enum__pages_v_blocks_specialty_grid_variant" DEFAULT 'cards',
  	"columns" "enum__pages_v_blocks_specialty_grid_columns" DEFAULT '4',
  	"default_icon" varchar DEFAULT 'stethoscope',
  	"link_to_directory" boolean,
  	"directory_path" varchar DEFAULT '/specialists/specialist-panel',
  	"cta_label" jsonb,
  	"container_width" "enum__pages_v_blocks_specialty_grid_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_specialty_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum__pages_v_blocks_specialty_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum__pages_v_blocks_specialty_grid_shadow" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_people_grid_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_people_grid_footer_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_blocks_people_grid_footer_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_people_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_people_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_people_grid_background" DEFAULT 'white',
  	"header_background" "enum__pages_v_blocks_people_grid_header_background" DEFAULT 'default',
  	"source" "enum__pages_v_blocks_people_grid_source" DEFAULT 'specialists',
  	"only_advertised" boolean,
  	"featured_only" boolean,
  	"specialty_id" integer,
  	"location_id" integer,
  	"asmt_type_id" integer,
  	"department_id" integer,
  	"group_by_department" boolean,
  	"layout" "enum__pages_v_blocks_people_grid_layout" DEFAULT 'grid',
  	"columns" "enum__pages_v_blocks_people_grid_columns" DEFAULT '4',
  	"limit" numeric DEFAULT 8,
  	"link_profiles" boolean,
  	"carousel_options_speed" numeric DEFAULT 60,
  	"carousel_options_direction" "enum__pages_v_blocks_people_grid_carousel_options_direction" DEFAULT 'left',
  	"carousel_options_show_arrows" boolean DEFAULT true,
  	"container_width" "enum__pages_v_blocks_people_grid_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_people_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum__pages_v_blocks_people_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum__pages_v_blocks_people_grid_shadow" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_grid_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_services_grid_footer_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_services_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_services_grid_background" DEFAULT 'white',
  	"source" "enum__pages_v_blocks_services_grid_source" DEFAULT 'auto',
  	"category" "enum__pages_v_blocks_services_grid_category",
  	"service_group" "enum__pages_v_blocks_services_grid_service_group",
  	"layout" "enum__pages_v_blocks_services_grid_layout" DEFAULT 'grid',
  	"columns" "enum__pages_v_blocks_services_grid_columns" DEFAULT '3',
  	"limit" numeric DEFAULT 12,
  	"link_to_service" boolean,
  	"show_enquire" boolean,
  	"hide_description" boolean,
  	"card_align" "enum__pages_v_blocks_services_grid_card_align" DEFAULT 'left',
  	"service_path_prefix" varchar DEFAULT '/services',
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_services_grid_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_services_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum__pages_v_blocks_services_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum__pages_v_blocks_services_grid_shadow" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_testimonials_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_testimonials_grid_background" DEFAULT 'white',
  	"source" "enum__pages_v_blocks_testimonials_grid_source" DEFAULT 'auto',
  	"featured_only" boolean,
  	"layout" "enum__pages_v_blocks_testimonials_grid_layout" DEFAULT 'grid',
  	"columns" "enum__pages_v_blocks_testimonials_grid_columns" DEFAULT '3',
  	"limit" numeric DEFAULT 6,
  	"carousel_options_visible" numeric DEFAULT 1,
  	"carousel_options_show_arrows" boolean DEFAULT true,
  	"container_width" "enum__pages_v_blocks_testimonials_grid_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_testimonials_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum__pages_v_blocks_testimonials_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum__pages_v_blocks_testimonials_grid_shadow" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_band_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"prefix" jsonb,
  	"suffix" jsonb,
  	"label" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_stats_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_stats_band_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_stats_band_background" DEFAULT 'primary',
  	"container_width" "enum__pages_v_blocks_stats_band_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_stats_band_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_aamle_education_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_aamle_education" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_aamle_education_background" DEFAULT 'white',
  	"eyebrow" jsonb,
  	"wordmark" jsonb,
  	"subheading" jsonb,
  	"badge_icon" varchar DEFAULT 'graduation-cap',
  	"badge_text" jsonb,
  	"description" jsonb,
  	"link_type" "enum__pages_v_blocks_aamle_education_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"image_id" integer,
  	"image_placeholder" boolean DEFAULT true,
  	"placeholder_label" jsonb,
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_aamle_education_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_aamle_education_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_feature_rows_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_feature_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"image_placeholder" boolean,
  	"placeholder_label" jsonb,
  	"placeholder_icon" varchar,
  	"image_side" "enum__pages_v_blocks_split_feature_rows_image_side" DEFAULT 'auto',
  	"eyebrow" jsonb,
  	"icon" varchar,
  	"title" jsonb,
  	"body" jsonb,
  	"bullets_label" jsonb,
  	"link_type" "enum__pages_v_blocks_split_feature_rows_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"anchor_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_split_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_split_feature_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_split_feature_background" DEFAULT 'white',
  	"row_style" "enum__pages_v_blocks_split_feature_row_style" DEFAULT 'spaced',
  	"density" "enum__pages_v_blocks_split_feature_density" DEFAULT 'default',
  	"bullet_style" "enum__pages_v_blocks_split_feature_bullet_style" DEFAULT 'check',
  	"heading_weight" "enum__pages_v_blocks_split_feature_heading_weight" DEFAULT 'default',
  	"container_width" "enum__pages_v_blocks_split_feature_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_split_feature_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_band_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"text" jsonb,
  	"container_width" "enum__pages_v_blocks_cta_band_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_cta_band_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" jsonb,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_tabs_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_tabs_background" DEFAULT 'white',
  	"tab_style" "enum__pages_v_blocks_tabs_tab_style" DEFAULT 'pills',
  	"default_tab" numeric DEFAULT 0,
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_tabs_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_tabs_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_callout_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_blocks_callout_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_callout" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"style" "enum__pages_v_blocks_callout_style" DEFAULT 'info',
  	"icon" varchar,
  	"tag" jsonb,
  	"heading" jsonb,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_details_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"value" jsonb,
  	"href" varchar,
  	"note" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_contact_details_text_colour" DEFAULT 'inherit',
  	"use_global" boolean DEFAULT true,
  	"container_width" "enum__pages_v_blocks_contact_details_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_contact_details_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_icon_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"text" jsonb,
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_icon_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_icon_list_text_colour" DEFAULT 'inherit',
  	"heading_align" "enum__pages_v_blocks_icon_list_heading_align",
  	"columns" "enum__pages_v_blocks_icon_list_columns" DEFAULT '1',
  	"container_width" "enum__pages_v_blocks_icon_list_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_icon_list_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_map_embed_actions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_map_embed_actions_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"link_appearance" "enum__pages_v_blocks_map_embed_actions_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_map_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_map_embed_text_colour" DEFAULT 'inherit',
  	"kind" "enum__pages_v_blocks_map_embed_kind" DEFAULT 'map',
  	"office_id" integer,
  	"embed_url" varchar,
  	"aspect" "enum__pages_v_blocks_map_embed_aspect" DEFAULT '16-9',
  	"title" varchar,
  	"show_office_info" boolean DEFAULT true,
  	"office_hours_heading" jsonb,
  	"transport_heading" jsonb,
  	"parking_heading" jsonb,
  	"container_width" "enum__pages_v_blocks_map_embed_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_map_embed_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_leadership_spotlight_credentials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"cred" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_leadership_spotlight" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_leadership_spotlight_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_leadership_spotlight_background" DEFAULT 'muted',
  	"photo_id" integer,
  	"placeholder_icon" varchar DEFAULT 'user-circle',
  	"name" jsonb,
  	"role" jsonb,
  	"badge" jsonb,
  	"tagline" jsonb,
  	"body" jsonb,
  	"link_type" "enum__pages_v_blocks_leadership_spotlight_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"container_width" "enum__pages_v_blocks_leadership_spotlight_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_leadership_spotlight_motion" DEFAULT 'none',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_portal_cta_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_portal_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_portal_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_portal_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_video_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_video_embed_text_colour" DEFAULT 'inherit',
  	"provider" "enum__pages_v_blocks_video_embed_provider" DEFAULT 'youtube',
  	"aspect" "enum__pages_v_blocks_video_embed_aspect" DEFAULT '16:9',
  	"video_id" varchar,
  	"url" varchar,
  	"video_title" varchar,
  	"caption" jsonb,
  	"background" "enum__pages_v_blocks_video_embed_background" DEFAULT 'white',
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_video_embed_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_video_embed_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_try_booking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_try_booking_text_colour" DEFAULT 'inherit',
  	"event_id" varchar,
  	"widget_type" "enum__pages_v_blocks_try_booking_widget_type" DEFAULT 'landingPageEmbed',
  	"fallback_label" jsonb,
  	"background" "enum__pages_v_blocks_try_booking_background" DEFAULT 'white',
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_try_booking_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_try_booking_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"card_style" "enum__pages_v_blocks_form_block_card_style",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_row_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"span" "enum__pages_v_blocks_row_columns_span" DEFAULT 'auto',
  	"align" "enum__pages_v_blocks_row_columns_align" DEFAULT 'left',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"gap" "enum__pages_v_blocks_row_gap" DEFAULT 'normal',
  	"align_y" "enum__pages_v_blocks_row_align_y" DEFAULT 'stretch',
  	"column_ratio" "enum__pages_v_blocks_row_column_ratio",
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_section_background" DEFAULT 'white',
  	"container_width" "enum__pages_v_blocks_section_container_width" DEFAULT 'normal',
  	"padding_top" "enum__pages_v_blocks_section_padding_top" DEFAULT 'normal',
  	"padding_bottom" "enum__pages_v_blocks_section_padding_bottom" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_section_motion" DEFAULT 'none',
  	"align" "enum__pages_v_blocks_section_align" DEFAULT 'left',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_archive_background" DEFAULT 'white',
  	"intro_content" jsonb,
  	"populate_by" "enum__pages_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__pages_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"view" "enum__pages_v_blocks_archive_view" DEFAULT 'upcoming',
  	"stream_id" integer,
  	"featured" boolean DEFAULT false,
  	"post_style" "enum__pages_v_blocks_archive_post_style" DEFAULT 'card',
  	"event_style" "enum__pages_v_blocks_archive_event_style" DEFAULT 'card',
  	"limit" numeric DEFAULT 10,
  	"columns" "enum__pages_v_blocks_archive_columns" DEFAULT '3',
  	"read_more_label" jsonb,
  	"view_all_link_link_type" "enum__pages_v_blocks_archive_view_all_link_link_type" DEFAULT 'reference',
  	"view_all_link_link_new_tab" boolean,
  	"view_all_link_link_url" varchar,
  	"view_all_link_link_label" jsonb,
  	"view_all_link_link_anchor" varchar,
  	"view_all_link_link_icon" varchar,
  	"anchor_id" varchar,
  	"hide_when_empty" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_availability" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_carousel" boolean DEFAULT true,
  	"show_legend" boolean DEFAULT true,
  	"show_specialty_badge" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_slide_carousel_slides_pills" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_slide_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" jsonb,
  	"body" jsonb,
  	"accent" "enum__pages_v_blocks_slide_carousel_slides_accent" DEFAULT 'seminars',
  	"visual_label" jsonb,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_slide_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"autoplay" boolean DEFAULT true,
  	"interval" numeric DEFAULT 5800,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_specialist_directory" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_specialist_directory_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_specialist_directory_background" DEFAULT 'white',
  	"enable_search" boolean DEFAULT true,
  	"enable_specialty" boolean DEFAULT true,
  	"enable_location" boolean DEFAULT true,
  	"enable_accreditation" boolean DEFAULT true,
  	"sort_by" "enum__pages_v_blocks_specialist_directory_sort_by" DEFAULT 'order',
  	"search_placeholder" varchar DEFAULT 'Search by name…',
  	"count_template" varchar DEFAULT '{count} specialists',
  	"search_group_label" varchar DEFAULT 'Search',
  	"specialty_group_label" varchar DEFAULT 'Filter by specialty',
  	"accreditation_group_label" varchar DEFAULT 'Filter by accreditation',
  	"location_group_label" varchar DEFAULT 'Filter by location',
  	"specialty_label" varchar DEFAULT 'Specialty',
  	"location_label" varchar DEFAULT 'Location',
  	"accreditation_label" varchar DEFAULT 'Accreditation',
  	"empty_heading" jsonb,
  	"empty_body" jsonb,
  	"card_cta_label" varchar DEFAULT 'View Profile',
  	"secondary_cta_label" varchar DEFAULT 'Request Availability',
  	"secondary_cta_href" varchar DEFAULT '/contact',
  	"reset_label" varchar DEFAULT 'Clear Filters',
  	"locations_label" varchar DEFAULT 'Consulting Locations',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_specialty_directory" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_specialty_directory_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_specialty_directory_background" DEFAULT 'white',
  	"show_filter_bar" boolean DEFAULT true,
  	"show_rosters" boolean DEFAULT true,
  	"show_key_areas" boolean DEFAULT true,
  	"all_tab_label" jsonb,
  	"empty_label" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_resources_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_resources_grid_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_resources_grid_background" DEFAULT 'white',
  	"source" "enum__pages_v_blocks_resources_grid_source" DEFAULT 'auto',
  	"variant" "enum__pages_v_blocks_resources_grid_variant" DEFAULT 'card',
  	"audience" "enum__pages_v_blocks_resources_grid_audience",
  	"resource_type" "enum__pages_v_blocks_resources_grid_resource_type",
  	"columns" "enum__pages_v_blocks_resources_grid_columns" DEFAULT '3',
  	"limit" numeric DEFAULT 12,
  	"anchor_id" varchar,
  	"hide_when_empty" boolean DEFAULT false,
  	"container_width" "enum__pages_v_blocks_resources_grid_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_resources_grid_motion" DEFAULT 'none',
  	"hover_effect" "enum__pages_v_blocks_resources_grid_hover_effect" DEFAULT 'lift',
  	"shadow" "enum__pages_v_blocks_resources_grid_shadow" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_appt_guide_v_types_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"heading" jsonb,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_hcards_v_bullets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_hcards_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_appt_guide_v_types_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"callout_style" "enum__appt_guide_v_types_tabs_callout_style" DEFAULT 'info',
  	"callout_text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_appt_guide_v_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb,
  	"sublabel" jsonb,
  	"anchor_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_appt_guide_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__appt_guide_v_text_colour" DEFAULT 'inherit',
  	"select_label" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_mission_pillars_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_mission_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"background" "enum__pages_v_blocks_mission_pillars_background" DEFAULT 'hero',
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_mission_pillars_text_colour" DEFAULT 'inherit',
  	"container_width" "enum__pages_v_blocks_mission_pillars_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_mission_pillars_motion" DEFAULT 'none',
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_value_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" jsonb,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_value_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_value_cards_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_value_cards_background" DEFAULT 'dark',
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_value_cards_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_value_cards_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_why_verify_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_why_verify" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_why_verify_text_colour" DEFAULT 'inherit',
  	"image_id" integer,
  	"placeholder_label" jsonb,
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_why_verify_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_why_verify_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_audience_pathways_pathways_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" jsonb,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_audience_pathways_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_audience_pathways_pathways_variant" DEFAULT 'client',
  	"eyebrow" jsonb,
  	"title" jsonb,
  	"description" jsonb,
  	"link_type" "enum__pages_v_blocks_audience_pathways_pathways_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_audience_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_audience_pathways_text_colour" DEFAULT 'inherit',
  	"background" "enum__pages_v_blocks_audience_pathways_background" DEFAULT 'white',
  	"anchor_id" varchar,
  	"container_width" "enum__pages_v_blocks_audience_pathways_container_width" DEFAULT 'normal',
  	"motion" "enum__pages_v_blocks_audience_pathways_motion" DEFAULT 'none',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_bkchooser_v_halves_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__bkchooser_v_halves_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb,
  	"link_anchor" varchar,
  	"link_icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_bkchooser_v_halves" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"accent" "enum__bkchooser_v_halves_accent" DEFAULT 'blue',
  	"eyebrow" jsonb,
  	"title" jsonb,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_bkchooser_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"anchor_id" varchar,
  	"density" "enum__bkchooser_v_density" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cost_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"title" jsonb,
  	"description" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cost_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_cost_grid_text_colour" DEFAULT 'inherit',
  	"note" jsonb,
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"placeholder" varchar DEFAULT 'Enter your email',
  	"button_label" jsonb,
  	"note" jsonb,
  	"anchor_id" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_section_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"anchor_id" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_section_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"sticky" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_featured_articles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"autoplay" boolean DEFAULT true,
  	"interval" numeric DEFAULT 5000,
  	"show_arrows" boolean DEFAULT true,
  	"show_dots" boolean DEFAULT true,
  	"source" "enum__pages_v_blocks_featured_articles_source" DEFAULT 'auto',
  	"limit" numeric DEFAULT 6,
  	"badge_label" jsonb,
  	"byline_prefix" jsonb,
  	"cta_label" jsonb,
  	"anchor_id" varchar,
  	"background" "enum__pages_v_blocks_featured_articles_background" DEFAULT 'white',
  	"hide_when_empty" boolean DEFAULT false,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_events_explorer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" jsonb,
  	"heading" jsonb,
  	"subheading" jsonb,
  	"text_colour" "enum__pages_v_blocks_events_explorer_text_colour" DEFAULT 'inherit',
  	"mode" "enum__pages_v_blocks_events_explorer_mode" DEFAULT 'all',
  	"page_size" numeric DEFAULT 8,
  	"show_search" boolean DEFAULT true,
  	"card_style" "enum__pages_v_blocks_events_explorer_card_style" DEFAULT 'list',
  	"groups_upcoming_eyebrow" jsonb,
  	"groups_upcoming_heading" varchar,
  	"groups_upcoming_intro" jsonb,
  	"groups_upcoming_link_label" jsonb,
  	"groups_upcoming_link_url" varchar,
  	"groups_past_eyebrow" jsonb,
  	"groups_past_heading" varchar,
  	"groups_past_intro" jsonb,
  	"groups_past_link_label" jsonb,
  	"groups_past_link_url" varchar,
  	"separator_divider" "enum__pages_v_blocks_events_explorer_separator_divider" DEFAULT 'none',
  	"separator_divider_width" "enum__pages_v_blocks_events_explorer_separator_divider_width" DEFAULT 'full',
  	"separator_past_background" "enum__pages_v_blocks_events_explorer_separator_past_background" DEFAULT 'default',
  	"labels_more_info_label" varchar,
  	"labels_view_recap_label" varchar,
  	"labels_upcoming_heading" varchar,
  	"labels_past_heading" varchar,
  	"labels_empty_upcoming" varchar,
  	"labels_empty_upcoming_search" varchar,
  	"labels_empty_past" varchar,
  	"labels_empty_past_search" varchar,
  	"labels_loading_label" varchar,
  	"labels_search_placeholder" varchar,
  	"labels_dates_label" varchar,
  	"labels_search_button_label" varchar,
  	"anchor_id" varchar,
  	"background" "enum__pages_v_blocks_events_explorer_background" DEFAULT 'white',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__pages_v_version_hero_type" DEFAULT 'pageHero',
  	"version_hero_eyebrow" jsonb,
  	"version_hero_heading" jsonb,
  	"version_hero_subtitle" jsonb,
  	"version_hero_show_breadcrumb" boolean DEFAULT true,
  	"version_hero_theme" "enum__pages_v_version_hero_theme" DEFAULT 'light',
  	"version_hero_align" "enum__pages_v_version_hero_align" DEFAULT 'left',
  	"version_hero_show_shield" boolean,
  	"version_hero_image_panel" boolean,
  	"version_hero_image_panel_label" jsonb,
  	"version_hero_hero_background" "enum__pages_v_version_hero_hero_background" DEFAULT 'accent-solid',
  	"version_hero_container_width" "enum__pages_v_version_hero_container_width" DEFAULT 'normal',
  	"version_hero_hero_padding_top" "enum__pages_v_version_hero_hero_padding_top" DEFAULT 'default',
  	"version_hero_hero_padding_bottom" "enum__pages_v_version_hero_hero_padding_bottom" DEFAULT 'default',
  	"version_hero_definition_term" jsonb,
  	"version_hero_definition_pronunciation" jsonb,
  	"version_hero_definition_text" jsonb,
  	"version_hero_definition_definition_style" "enum__pages_v_version_hero_definition_definition_style" DEFAULT 'glow',
  	"version_hero_definition_interaction" "enum__pages_v_version_hero_definition_interaction" DEFAULT 'full',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_parent_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"specialists_id" integer,
  	"team_id" integer,
  	"events_id" integer,
  	"services_id" integer,
  	"testimonials_id" integer,
  	"categories_id" integer,
  	"resources_id" integer
  );
  
  CREATE TABLE "posts_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" jsonb
  );
  
  CREATE TABLE "posts_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"excerpt" varchar,
  	"read_time" numeric,
  	"author_name" varchar,
  	"author_role" jsonb,
  	"author_photo_id" integer,
  	"author_bio" jsonb,
  	"content" jsonb,
  	"show_toc" boolean DEFAULT true,
  	"stream_id" integer,
  	"featured" boolean DEFAULT false,
  	"specialty_id" integer,
  	"related_specialist_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"team_id" integer,
  	"specialists_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "_posts_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_excerpt" varchar,
  	"version_read_time" numeric,
  	"version_author_name" varchar,
  	"version_author_role" jsonb,
  	"version_author_photo_id" integer,
  	"version_author_bio" jsonb,
  	"version_content" jsonb,
  	"version_show_toc" boolean DEFAULT true,
  	"version_stream_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_specialty_id" integer,
  	"version_related_specialist_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"team_id" integer,
  	"specialists_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "events_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" jsonb
  );
  
  CREATE TABLE "events_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" jsonb
  );
  
  CREATE TABLE "events_guest_presenters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" jsonb,
  	"organisation" jsonb
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone,
  	"time_label" jsonb,
  	"location" jsonb,
  	"host" "enum_events_host" DEFAULT 'aamle',
  	"registration_url" varchar,
  	"registration_label" jsonb,
  	"host_event_url" varchar,
  	"registration_closes_at" timestamp(3) with time zone,
  	"cpd_eligible" boolean,
  	"cpd_points" numeric,
  	"cost" jsonb,
  	"location_ref_id" integer,
  	"image_id" integer,
  	"excerpt" varchar,
  	"description" jsonb,
  	"recap" jsonb,
  	"show_toc" boolean DEFAULT true,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"event_type_id" integer,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"specialists_id" integer,
  	"team_id" integer
  );
  
  CREATE TABLE "_events_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_attachments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"label" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_guest_presenters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" jsonb,
  	"organisation" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_time_label" jsonb,
  	"version_location" jsonb,
  	"version_host" "enum__events_v_version_host" DEFAULT 'aamle',
  	"version_registration_url" varchar,
  	"version_registration_label" jsonb,
  	"version_host_event_url" varchar,
  	"version_registration_closes_at" timestamp(3) with time zone,
  	"version_cpd_eligible" boolean,
  	"version_cpd_points" numeric,
  	"version_cost" jsonb,
  	"version_location_ref_id" integer,
  	"version_image_id" integer,
  	"version_excerpt" varchar,
  	"version_description" jsonb,
  	"version_recap" jsonb,
  	"version_show_toc" boolean DEFAULT true,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_event_type_id" integer,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"specialists_id" integer,
  	"team_id" integer
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"category" "enum_services_category" DEFAULT 'medico-legal' NOT NULL,
  	"service_group" "enum_services_service_group",
  	"icon" varchar,
  	"photo_id" integer,
  	"link_override" varchar,
  	"short_description" jsonb,
  	"body" jsonb,
  	"featured" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" varchar,
  	"resource_type" "enum_resources_resource_type" DEFAULT 'guide',
  	"audience" "enum_resources_audience" DEFAULT 'clients',
  	"description" jsonb,
  	"file_id" integer,
  	"external_url" varchar,
  	"cta_label" jsonb,
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "offices_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar,
  	"time" varchar
  );
  
  CREATE TABLE "offices_transport" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" jsonb NOT NULL,
  	"note" jsonb,
  	"href" varchar
  );
  
  CREATE TABLE "offices_parking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" jsonb NOT NULL,
  	"address" varchar,
  	"walk_time" jsonb,
  	"height_limit" jsonb,
  	"href" varchar,
  	"note" jsonb
  );
  
  CREATE TABLE "offices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"is_primary" boolean DEFAULT false,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"map_embed_url" varchar,
  	"hours_note" jsonb,
  	"note" jsonb,
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" jsonb NOT NULL,
  	"author_role" jsonb NOT NULL,
  	"org" jsonb,
  	"rating" numeric DEFAULT 5,
  	"order" numeric DEFAULT 0,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "specialties_key_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area" jsonb NOT NULL
  );
  
  CREATE TABLE "specialties" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" varchar,
  	"category_id" integer,
  	"description" jsonb,
  	"order" numeric,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "specialty_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" varchar,
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "claim_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"order" numeric,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "assessment_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "areas_of_expertise" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "accreditations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" varchar,
  	"description" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"region" varchar,
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "streams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" varchar,
  	"description" jsonb,
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_breadcrumbs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"doc_id" integer,
  	"url" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon" varchar,
  	"color" varchar,
  	"description" jsonb,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"parent_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "specialists_qualifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"qualification" jsonb,
  	"icon" varchar
  );
  
  CREATE TABLE "specialists_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"language" varchar
  );
  
  CREATE TABLE "specialists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar,
  	"position" jsonb,
  	"photo_id" integer,
  	"profile_photo_shape" "enum_specialists_profile_photo_shape" DEFAULT 'square',
  	"bio" jsonb,
  	"booking_url" varchar,
  	"cv_id" integer,
  	"sample_report_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"specialty_id" integer,
  	"featured" boolean DEFAULT false,
  	"advertise" boolean DEFAULT false,
  	"availability_highlight" boolean DEFAULT false,
  	"availability_note" varchar DEFAULT 'Call to book',
  	"first_name" varchar,
  	"last_name" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_specialists_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "specialists_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"accreditations_id" integer,
  	"claim_types_id" integer,
  	"assessment_types_id" integer,
  	"areas_of_expertise_id" integer
  );
  
  CREATE TABLE "_specialists_v_version_qualifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"qualification" jsonb,
  	"icon" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_specialists_v_version_languages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"language" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_specialists_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_title" varchar,
  	"version_position" jsonb,
  	"version_photo_id" integer,
  	"version_profile_photo_shape" "enum__specialists_v_version_profile_photo_shape" DEFAULT 'square',
  	"version_bio" jsonb,
  	"version_booking_url" varchar,
  	"version_cv_id" integer,
  	"version_sample_report_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_specialty_id" integer,
  	"version_featured" boolean DEFAULT false,
  	"version_advertise" boolean DEFAULT false,
  	"version_availability_highlight" boolean DEFAULT false,
  	"version_availability_note" varchar DEFAULT 'Call to book',
  	"version_first_name" varchar,
  	"version_last_name" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__specialists_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_specialists_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locations_id" integer,
  	"accreditations_id" integer,
  	"claim_types_id" integer,
  	"assessment_types_id" integer,
  	"areas_of_expertise_id" integer
  );
  
  CREATE TABLE "team_qualifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"qualification" jsonb
  );
  
  CREATE TABLE "team_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" jsonb,
  	"body" jsonb
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"role" jsonb,
  	"photo_id" integer,
  	"profile_photo_id" integer,
  	"hide_photo_on_profile" boolean DEFAULT false,
  	"profile_photo_shape" "enum_team_profile_photo_shape" DEFAULT 'tall',
  	"bio" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"department_id" integer,
  	"order" numeric DEFAULT 0,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_team_v_version_qualifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"qualification" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_team_v_version_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" jsonb,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_team_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_role" jsonb,
  	"version_photo_id" integer,
  	"version_profile_photo_id" integer,
  	"version_hide_photo_on_profile" boolean DEFAULT false,
  	"version_profile_photo_shape" "enum__team_v_version_profile_photo_shape" DEFAULT 'tall',
  	"version_bio" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_department_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "availability_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"specialist_id" integer NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL,
  	"mode" "enum_availability_sessions_mode" DEFAULT 'either' NOT NULL,
  	"notes" varchar,
  	"status" "enum_availability_sessions_status" DEFAULT 'available' NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" jsonb,
  	"zoom" numeric,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_square_url" varchar,
  	"sizes_square_width" numeric,
  	"sizes_square_height" numeric,
  	"sizes_square_mime_type" varchar,
  	"sizes_square_filesize" numeric,
  	"sizes_square_filename" varchar,
  	"sizes_small_url" varchar,
  	"sizes_small_width" numeric,
  	"sizes_small_height" numeric,
  	"sizes_small_mime_type" varchar,
  	"sizes_small_filesize" numeric,
  	"sizes_small_filename" varchar,
  	"sizes_medium_url" varchar,
  	"sizes_medium_width" numeric,
  	"sizes_medium_height" numeric,
  	"sizes_medium_mime_type" varchar,
  	"sizes_medium_filesize" numeric,
  	"sizes_medium_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_xlarge_url" varchar,
  	"sizes_xlarge_width" numeric,
  	"sizes_xlarge_height" numeric,
  	"sizes_xlarge_mime_type" varchar,
  	"sizes_xlarge_filesize" numeric,
  	"sizes_xlarge_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "icons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"colour" "enum_icons_colour" DEFAULT 'inherit',
  	"view_box" varchar,
  	"markup" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "forms_blocks_checkbox" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"default_value" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_email" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"placeholder" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_message" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_number" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" numeric,
  	"required" boolean,
  	"placeholder" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_select_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "forms_blocks_select" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"placeholder" varchar,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_state" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"placeholder" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_textarea" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"default_value" varchar,
  	"required" boolean,
  	"placeholder" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email_to" varchar,
  	"cc" varchar,
  	"bcc" varchar,
  	"reply_to" varchar,
  	"email_from" varchar,
  	"subject" varchar DEFAULT 'You''ve received a new message.' NOT NULL,
  	"message" jsonb
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"submit_button_label" varchar,
  	"confirmation_type" "enum_forms_confirmation_type" DEFAULT 'message',
  	"confirmation_message" jsonb,
  	"redirect_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "form_submissions_submission_data" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "form_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"slug" varchar,
  	"uri" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"specialists_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_folders_folder_type" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_payload_folders_folder_type",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "payload_folders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"events_id" integer,
  	"services_id" integer,
  	"resources_id" integer,
  	"offices_id" integer,
  	"testimonials_id" integer,
  	"specialties_id" integer,
  	"specialty_categories_id" integer,
  	"claim_types_id" integer,
  	"assessment_types_id" integer,
  	"event_types_id" integer,
  	"areas_of_expertise_id" integer,
  	"accreditations_id" integer,
  	"locations_id" integer,
  	"streams_id" integer,
  	"categories_id" integer,
  	"departments_id" integer,
  	"specialists_id" integer,
  	"team_id" integer,
  	"availability_sessions_id" integer,
  	"media_id" integer,
  	"icons_id" integer,
  	"users_id" integer,
  	"redirects_id" integer,
  	"forms_id" integer,
  	"form_submissions_id" integer,
  	"search_id" integer,
  	"payload_folders_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "article_settings_sidebar_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"heading" jsonb NOT NULL,
  	"body" jsonb,
  	"link_type" "enum_article_settings_sidebar_cards_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb NOT NULL,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "article_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"labels_attachments_heading" jsonb,
  	"labels_related" jsonb,
  	"labels_toc" jsonb,
  	"labels_topics" jsonb,
  	"labels_breadcrumb_section_label" varchar DEFAULT 'In the Loop',
  	"labels_stream_fallback_subtitle" jsonb,
  	"labels_byline_prefix" varchar DEFAULT 'By ',
  	"labels_min_read_suffix" varchar DEFAULT 'min read',
  	"labels_share_linkedin_label" varchar DEFAULT 'Share on LinkedIn',
  	"labels_share_copy_label" varchar DEFAULT 'Copy link',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "article_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"specialists_id" integer,
  	"team_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "events_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"aamle_blurb" jsonb,
  	"aamle_callout" jsonb,
  	"aamle_attend_heading" jsonb,
  	"aamle_recap_heading" jsonb,
  	"aamle_attend_body" jsonb,
  	"aamle_register_label" varchar,
  	"aamle_contact_label" varchar,
  	"aamle_host_event_link_label" varchar,
  	"verify_blurb" jsonb,
  	"verify_callout" jsonb,
  	"verify_attend_heading" jsonb,
  	"verify_recap_heading" jsonb,
  	"verify_attend_body" jsonb,
  	"verify_register_label" varchar,
  	"verify_contact_label" varchar,
  	"verify_host_event_link_label" varchar,
  	"labels_presenters_heading" jsonb,
  	"labels_breadcrumb_section_label" varchar DEFAULT 'Events & Seminars',
  	"labels_status_upcoming_label" varchar DEFAULT 'Upcoming Event',
  	"labels_status_past_label" varchar DEFAULT 'Past Event',
  	"labels_free_label" varchar DEFAULT 'Free',
  	"labels_cpd_points_template" varchar DEFAULT 'CPD · {points} point(s)',
  	"labels_cpd_eligible_label" varchar DEFAULT 'CPD eligible',
  	"labels_concluded_fallback" jsonb,
  	"labels_concluded_with_materials" jsonb,
  	"labels_back_to_events_label" varchar DEFAULT 'Back to all events',
  	"labels_contact_url" varchar DEFAULT '/contact',
  	"labels_recap_toc_label" jsonb,
  	"labels_gallery_heading" jsonb,
  	"labels_attachments_heading" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "team_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"labels_breadcrumb_section_label" varchar DEFAULT 'Meet the Team',
  	"labels_qualification_label" jsonb,
  	"labels_about_prefix" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "specialist_profile_portal_cta_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar,
  	"label" jsonb NOT NULL
  );
  
  CREATE TABLE "specialist_profile" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portal_cta_eyebrow" jsonb,
  	"portal_cta_heading" jsonb,
  	"portal_cta_subheading" jsonb,
  	"portal_cta_enquiry_label" varchar DEFAULT 'Send Enquiry',
  	"portal_cta_booking_label" varchar DEFAULT 'Book an appointment',
  	"portal_cta_cv_label" varchar DEFAULT 'Download CV',
  	"portal_cta_sample_report_label" varchar DEFAULT 'Sample report',
  	"portal_cta_enquiry_email" varchar,
  	"portal_enquiry_subject" varchar DEFAULT 'VERIFY Booking Portal Access Request',
  	"portal_enquiry_type" varchar DEFAULT 'Register for Online Booking Portal',
  	"labels_biography" jsonb,
  	"labels_assessment_areas" jsonb,
  	"labels_qualifications" jsonb,
  	"labels_accreditations" jsonb,
  	"labels_assessment_types" jsonb,
  	"labels_claim_types" jsonb,
  	"breadcrumb_breadcrumb_parent_label" varchar DEFAULT 'Specialist Panel',
  	"breadcrumb_breadcrumb_parent_href" varchar DEFAULT '/specialists/specialist-panel',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "specialist_availability" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Specialist Availability',
  	"intro" jsonb,
  	"carousel_eyebrow" jsonb,
  	"carousel_title" jsonb,
  	"carousel_subtitle" jsonb,
  	"enquiry_email" varchar DEFAULT 'admin@vmls.com.au',
  	"enquiry_subject" varchar DEFAULT 'Specialist Availability Enquiry',
  	"enquiry_body_intro" varchar DEFAULT 'Hello VERIFY team,
  
  I would like to enquire about the following appointment sessions:',
  	"enquiry_body_footer" varchar DEFAULT 'My name is:
  My contact number is:
  Claim / referrer details (if any):
  
  Thank you.',
  	"labels_mode_in_person_label" varchar DEFAULT 'In-person',
  	"labels_mode_telehealth_label" varchar DEFAULT 'Telehealth',
  	"labels_mode_either_label" varchar DEFAULT 'In-person / Telehealth',
  	"labels_selection_hint" varchar DEFAULT 'Tap sessions to select, then send us an enquiry.',
  	"labels_clear_label" varchar DEFAULT 'Clear',
  	"labels_send_enquiry_label" varchar DEFAULT 'Send enquiry',
  	"labels_sessions_selected_template" varchar DEFAULT '{count} {noun} selected',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_nav_items_sub_items_sub_sub_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_sub_items_sub_sub_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb NOT NULL,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "header_nav_items_sub_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_sub_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb NOT NULL,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_header_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb NOT NULL,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_enabled" boolean DEFAULT true,
  	"cta_link_type" "enum_header_cta_link_type" DEFAULT 'reference',
  	"cta_link_new_tab" boolean,
  	"cta_link_url" varchar,
  	"cta_link_label" jsonb NOT NULL,
  	"cta_link_anchor" varchar,
  	"cta_link_icon" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"specialists_id" integer,
  	"team_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_columns_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb NOT NULL,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" jsonb NOT NULL
  );
  
  CREATE TABLE "footer_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar,
  	"time" varchar
  );
  
  CREATE TABLE "footer_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_platform" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_legal_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" jsonb NOT NULL,
  	"link_anchor" varchar,
  	"link_icon" varchar
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tagline" jsonb,
  	"contact_phone" varchar,
  	"contact_phone_href" varchar,
  	"contact_email" varchar,
  	"contact_address" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"specialists_id" integer,
  	"team_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_name" varchar DEFAULT 'VERIFY Medico-Legal Solutions',
  	"logo_id" integer,
  	"logo_footer_id" integer,
  	"favicon_id" integer,
  	"shield_id" integer,
  	"social_image_id" integer,
  	"enquiry_form_id" integer,
  	"registration_enquiry_email" varchar DEFAULT 'admin@vmls.com.au',
  	"registration_enquiry_subject" varchar DEFAULT 'VERIFY Booking Portal Access Request',
  	"registration_enquiry_body" varchar DEFAULT 'Hi VERIFY team,
  
  I would like to request access to VERIFY''s Online Booking Portal. Please find my details below for account creation:
  
  Full Name: 
  Company/Organisation: 
  Contact Number: 
  Email Address: 
  
  Please let me know if you require any further information to set up my account.
  
  Kind regards,',
  	"colors_primary" varchar,
  	"colors_primary_strong" varchar,
  	"colors_text" varchar,
  	"colors_muted_text" varchar,
  	"colors_accent" varchar,
  	"colors_border" varchar,
  	"colors_accent_light" varchar,
  	"colors_primary_deep" varchar,
  	"colors_text_on_dark" varchar,
  	"colors_muted_text_on_dark" varchar,
  	"colors_accent_on_dark" varchar,
  	"colors_border_on_dark" varchar,
  	"colors_background" varchar,
  	"colors_surface" varchar,
  	"colors_surface_text" varchar,
  	"colors_white" varchar,
  	"colors_muted" varchar,
  	"colors_primary_text" varchar,
  	"colors_ring" varchar,
  	"colors_secondary" varchar,
  	"colors_secondary_text" varchar,
  	"colors_secondary_bright" varchar,
  	"colors_gradient_start" varchar,
  	"colors_steel" varchar,
  	"colors_navy" varchar,
  	"colors_definition_blue" varchar,
  	"colors_pale_surface" varchar,
  	"colors_ink_black" varchar,
  	"colors_ink_charcoal" varchar,
  	"colors_ink_grey" varchar,
  	"colors_success" varchar,
  	"colors_warning" varchar,
  	"colors_error" varchar,
  	"colors_form_error" varchar,
  	"colors_callout_info" varchar,
  	"colors_callout_note" varchar,
  	"colors_callout_success" varchar,
  	"colors_callout_warning" varchar,
  	"colors_avail_in_person" varchar,
  	"colors_avail_telehealth" varchar,
  	"colors_avail_either" varchar,
  	"breadcrumbs_home_label" varchar DEFAULT 'Home',
  	"breadcrumbs_separator" varchar DEFAULT '›',
  	"breadcrumbs_nav_label" varchar DEFAULT 'Breadcrumb',
  	"accessibility_skip_link_label" varchar DEFAULT 'Skip to content',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "custom_styles_presets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"css" varchar NOT NULL
  );
  
  CREATE TABLE "custom_styles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_css" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "design_system" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"typography_heading_font" varchar,
  	"typography_body_font" varchar,
  	"typography_base_size" varchar,
  	"typography_text_scale" "enum_design_system_typography_text_scale" DEFAULT '1',
  	"spacing_compact" varchar,
  	"spacing_normal" varchar,
  	"spacing_spacious" varchar,
  	"spacing_xl" varchar,
  	"gaps_tight" varchar,
  	"gaps_normal" varchar,
  	"gaps_wide" varchar,
  	"headings_sm" varchar,
  	"headings_md" varchar,
  	"headings_lg" varchar,
  	"headings_xl" varchar,
  	"headings_display" varchar,
  	"text_sm" varchar,
  	"text_base" varchar,
  	"text_lg" varchar,
  	"radius_none" varchar,
  	"radius_sm" varchar,
  	"radius_chip" varchar,
  	"radius_card" varchar,
  	"radius_tile" varchar,
  	"radius_md" varchar,
  	"radius_panel" varchar,
  	"radius_pill" varchar,
  	"radius_circle" varchar,
  	"radius_base" varchar,
  	"gradients_image_tint" varchar,
  	"gradients_deep" varchar,
  	"gradients_hero" varchar,
  	"gradients_avatar_tint" varchar,
  	"bands_muted" varchar,
  	"bands_accent" varchar,
  	"bands_primary" varchar,
  	"bands_dark" varchar,
  	"effects_color" varchar,
  	"effects_color_deep" varchar,
  	"effects_xs" varchar,
  	"effects_sm" varchar,
  	"effects_md" varchar,
  	"effects_lg" varchar,
  	"effects_xl" varchar,
  	"effects_xxl" varchar,
  	"effects_glow_sm" varchar,
  	"effects_glow_md" varchar,
  	"effects_glow_lg" varchar,
  	"effects_ring" varchar,
  	"effects_inset_highlight" varchar,
  	"effects_hard" varchar,
  	"effects_transition" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "icon_library" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "icon_library_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "pages_hero_meta_items" ADD CONSTRAINT "pages_hero_meta_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_hero_links" ADD CONSTRAINT "pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_heading" ADD CONSTRAINT "pages_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text" ADD CONSTRAINT "pages_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_button_links" ADD CONSTRAINT "pages_blocks_button_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_button"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_button" ADD CONSTRAINT "pages_blocks_button_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_spacer" ADD CONSTRAINT "pages_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_divider" ADD CONSTRAINT "pages_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_icon_block" ADD CONSTRAINT "pages_blocks_icon_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_items" ADD CONSTRAINT "pages_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq" ADD CONSTRAINT "pages_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gateway_cards_cards_links" ADD CONSTRAINT "pages_blocks_gateway_cards_cards_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gateway_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gateway_cards_cards" ADD CONSTRAINT "pages_blocks_gateway_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_gateway_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_gateway_cards" ADD CONSTRAINT "pages_blocks_gateway_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_items_bullets" ADD CONSTRAINT "pages_blocks_feature_grid_items_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_items_details" ADD CONSTRAINT "pages_blocks_feature_grid_items_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_items" ADD CONSTRAINT "pages_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid" ADD CONSTRAINT "pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_steps_bullets" ADD CONSTRAINT "pages_blocks_process_steps_steps_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_steps" ADD CONSTRAINT "pages_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_specialty_grid_items" ADD CONSTRAINT "pages_blocks_specialty_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_specialty_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_specialty_grid" ADD CONSTRAINT "pages_blocks_specialty_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_people_grid_footer_links" ADD CONSTRAINT "pages_blocks_people_grid_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_people_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_people_grid" ADD CONSTRAINT "pages_blocks_people_grid_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_people_grid" ADD CONSTRAINT "pages_blocks_people_grid_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_people_grid" ADD CONSTRAINT "pages_blocks_people_grid_asmt_type_id_assessment_types_id_fk" FOREIGN KEY ("asmt_type_id") REFERENCES "public"."assessment_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_people_grid" ADD CONSTRAINT "pages_blocks_people_grid_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_people_grid" ADD CONSTRAINT "pages_blocks_people_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_grid_footer_links" ADD CONSTRAINT "pages_blocks_services_grid_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_grid" ADD CONSTRAINT "pages_blocks_services_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_grid" ADD CONSTRAINT "pages_blocks_testimonials_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_band_stats" ADD CONSTRAINT "pages_blocks_stats_band_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_stats_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_stats_band" ADD CONSTRAINT "pages_blocks_stats_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_aamle_education_items" ADD CONSTRAINT "pages_blocks_aamle_education_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_aamle_education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_aamle_education" ADD CONSTRAINT "pages_blocks_aamle_education_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_aamle_education" ADD CONSTRAINT "pages_blocks_aamle_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_feature_rows_bullets" ADD CONSTRAINT "pages_blocks_split_feature_rows_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_feature_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_feature_rows" ADD CONSTRAINT "pages_blocks_split_feature_rows_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_feature_rows" ADD CONSTRAINT "pages_blocks_split_feature_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_split_feature"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_split_feature" ADD CONSTRAINT "pages_blocks_split_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band_links" ADD CONSTRAINT "pages_blocks_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_band" ADD CONSTRAINT "pages_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs_tabs" ADD CONSTRAINT "pages_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs" ADD CONSTRAINT "pages_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout_links" ADD CONSTRAINT "pages_blocks_callout_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_callout" ADD CONSTRAINT "pages_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_details_items" ADD CONSTRAINT "pages_blocks_contact_details_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_details" ADD CONSTRAINT "pages_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_icon_list_items" ADD CONSTRAINT "pages_blocks_icon_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_icon_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_icon_list" ADD CONSTRAINT "pages_blocks_icon_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed_actions" ADD CONSTRAINT "pages_blocks_map_embed_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_map_embed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed" ADD CONSTRAINT "pages_blocks_map_embed_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed" ADD CONSTRAINT "pages_blocks_map_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_leadership_spotlight_credentials" ADD CONSTRAINT "pages_blocks_leadership_spotlight_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_leadership_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_leadership_spotlight" ADD CONSTRAINT "pages_blocks_leadership_spotlight_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_leadership_spotlight" ADD CONSTRAINT "pages_blocks_leadership_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portal_cta_tiles" ADD CONSTRAINT "pages_blocks_portal_cta_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_portal_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portal_cta_links" ADD CONSTRAINT "pages_blocks_portal_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_portal_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portal_cta" ADD CONSTRAINT "pages_blocks_portal_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_video_embed" ADD CONSTRAINT "pages_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_try_booking" ADD CONSTRAINT "pages_blocks_try_booking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_row_columns" ADD CONSTRAINT "pages_blocks_row_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_row"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_row" ADD CONSTRAINT "pages_blocks_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_section" ADD CONSTRAINT "pages_blocks_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_archive" ADD CONSTRAINT "pages_blocks_archive_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_archive" ADD CONSTRAINT "pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_availability" ADD CONSTRAINT "pages_blocks_availability_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_slide_carousel_slides_pills" ADD CONSTRAINT "pages_blocks_slide_carousel_slides_pills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_slide_carousel_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_slide_carousel_slides" ADD CONSTRAINT "pages_blocks_slide_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_slide_carousel_slides" ADD CONSTRAINT "pages_blocks_slide_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_slide_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_slide_carousel" ADD CONSTRAINT "pages_blocks_slide_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_specialist_directory" ADD CONSTRAINT "pages_blocks_specialist_directory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_specialty_directory" ADD CONSTRAINT "pages_blocks_specialty_directory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_resources_grid" ADD CONSTRAINT "pages_blocks_resources_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appt_guide_types_tabs_items" ADD CONSTRAINT "appt_guide_types_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appt_guide_types_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hcards_bullets" ADD CONSTRAINT "hcards_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hcards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hcards" ADD CONSTRAINT "hcards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appt_guide_types_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appt_guide_types_tabs" ADD CONSTRAINT "appt_guide_types_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appt_guide_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appt_guide_types" ADD CONSTRAINT "appt_guide_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."appt_guide"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "appt_guide" ADD CONSTRAINT "appt_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_mission_pillars_pillars" ADD CONSTRAINT "pages_blocks_mission_pillars_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_mission_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_mission_pillars" ADD CONSTRAINT "pages_blocks_mission_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_value_cards_cards" ADD CONSTRAINT "pages_blocks_value_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_value_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_value_cards" ADD CONSTRAINT "pages_blocks_value_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_why_verify_items" ADD CONSTRAINT "pages_blocks_why_verify_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_why_verify"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_why_verify" ADD CONSTRAINT "pages_blocks_why_verify_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_why_verify" ADD CONSTRAINT "pages_blocks_why_verify_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_audience_pathways_pathways_steps" ADD CONSTRAINT "pages_blocks_audience_pathways_pathways_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_audience_pathways_pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_audience_pathways_pathways" ADD CONSTRAINT "pages_blocks_audience_pathways_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_audience_pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_audience_pathways" ADD CONSTRAINT "pages_blocks_audience_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bkchooser_halves_links" ADD CONSTRAINT "bkchooser_halves_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bkchooser_halves"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bkchooser_halves" ADD CONSTRAINT "bkchooser_halves_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bkchooser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bkchooser" ADD CONSTRAINT "bkchooser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cost_grid_cards" ADD CONSTRAINT "pages_blocks_cost_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cost_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cost_grid" ADD CONSTRAINT "pages_blocks_cost_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_section_nav_items" ADD CONSTRAINT "pages_blocks_section_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_section_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_section_nav" ADD CONSTRAINT "pages_blocks_section_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_featured_articles" ADD CONSTRAINT "pages_blocks_featured_articles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_events_explorer" ADD CONSTRAINT "pages_blocks_events_explorer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_breadcrumbs" ADD CONSTRAINT "pages_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_meta_items" ADD CONSTRAINT "_pages_v_version_hero_meta_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links" ADD CONSTRAINT "_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_heading" ADD CONSTRAINT "_pages_v_blocks_heading_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text" ADD CONSTRAINT "_pages_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button_links" ADD CONSTRAINT "_pages_v_blocks_button_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_button"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button" ADD CONSTRAINT "_pages_v_blocks_button_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_spacer" ADD CONSTRAINT "_pages_v_blocks_spacer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_divider" ADD CONSTRAINT "_pages_v_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_block" ADD CONSTRAINT "_pages_v_blocks_icon_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_block" ADD CONSTRAINT "_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_items" ADD CONSTRAINT "_pages_v_blocks_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq" ADD CONSTRAINT "_pages_v_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gateway_cards_cards_links" ADD CONSTRAINT "_pages_v_blocks_gateway_cards_cards_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gateway_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gateway_cards_cards" ADD CONSTRAINT "_pages_v_blocks_gateway_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_gateway_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_gateway_cards" ADD CONSTRAINT "_pages_v_blocks_gateway_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid_items_bullets" ADD CONSTRAINT "_pages_v_blocks_feature_grid_items_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_grid_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid_items_details" ADD CONSTRAINT "_pages_v_blocks_feature_grid_items_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_grid_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid_items" ADD CONSTRAINT "_pages_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid" ADD CONSTRAINT "_pages_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_steps_bullets" ADD CONSTRAINT "_pages_v_blocks_process_steps_steps_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_specialty_grid_items" ADD CONSTRAINT "_pages_v_blocks_specialty_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_specialty_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_specialty_grid" ADD CONSTRAINT "_pages_v_blocks_specialty_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_people_grid_footer_links" ADD CONSTRAINT "_pages_v_blocks_people_grid_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_people_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_people_grid" ADD CONSTRAINT "_pages_v_blocks_people_grid_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_people_grid" ADD CONSTRAINT "_pages_v_blocks_people_grid_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_people_grid" ADD CONSTRAINT "_pages_v_blocks_people_grid_asmt_type_id_assessment_types_id_fk" FOREIGN KEY ("asmt_type_id") REFERENCES "public"."assessment_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_people_grid" ADD CONSTRAINT "_pages_v_blocks_people_grid_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_people_grid" ADD CONSTRAINT "_pages_v_blocks_people_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_grid_footer_links" ADD CONSTRAINT "_pages_v_blocks_services_grid_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_grid" ADD CONSTRAINT "_pages_v_blocks_services_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_grid" ADD CONSTRAINT "_pages_v_blocks_testimonials_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_band_stats" ADD CONSTRAINT "_pages_v_blocks_stats_band_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_stats_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_stats_band" ADD CONSTRAINT "_pages_v_blocks_stats_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_aamle_education_items" ADD CONSTRAINT "_pages_v_blocks_aamle_education_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_aamle_education"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_aamle_education" ADD CONSTRAINT "_pages_v_blocks_aamle_education_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_aamle_education" ADD CONSTRAINT "_pages_v_blocks_aamle_education_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_feature_rows_bullets" ADD CONSTRAINT "_pages_v_blocks_split_feature_rows_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split_feature_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_feature_rows" ADD CONSTRAINT "_pages_v_blocks_split_feature_rows_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_feature_rows" ADD CONSTRAINT "_pages_v_blocks_split_feature_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_split_feature"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_feature" ADD CONSTRAINT "_pages_v_blocks_split_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band_links" ADD CONSTRAINT "_pages_v_blocks_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_band" ADD CONSTRAINT "_pages_v_blocks_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs" ADD CONSTRAINT "_pages_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout_links" ADD CONSTRAINT "_pages_v_blocks_callout_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_callout"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_callout" ADD CONSTRAINT "_pages_v_blocks_callout_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_details_items" ADD CONSTRAINT "_pages_v_blocks_contact_details_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_details"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_details" ADD CONSTRAINT "_pages_v_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_list_items" ADD CONSTRAINT "_pages_v_blocks_icon_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_icon_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_list" ADD CONSTRAINT "_pages_v_blocks_icon_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed_actions" ADD CONSTRAINT "_pages_v_blocks_map_embed_actions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_map_embed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD CONSTRAINT "_pages_v_blocks_map_embed_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD CONSTRAINT "_pages_v_blocks_map_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_leadership_spotlight_credentials" ADD CONSTRAINT "_pages_v_blocks_leadership_spotlight_credentials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_leadership_spotlight"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_leadership_spotlight" ADD CONSTRAINT "_pages_v_blocks_leadership_spotlight_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_leadership_spotlight" ADD CONSTRAINT "_pages_v_blocks_leadership_spotlight_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portal_cta_tiles" ADD CONSTRAINT "_pages_v_blocks_portal_cta_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_portal_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portal_cta_links" ADD CONSTRAINT "_pages_v_blocks_portal_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_portal_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portal_cta" ADD CONSTRAINT "_pages_v_blocks_portal_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_video_embed" ADD CONSTRAINT "_pages_v_blocks_video_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_try_booking" ADD CONSTRAINT "_pages_v_blocks_try_booking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_row_columns" ADD CONSTRAINT "_pages_v_blocks_row_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_row"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_row" ADD CONSTRAINT "_pages_v_blocks_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section" ADD CONSTRAINT "_pages_v_blocks_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_archive" ADD CONSTRAINT "_pages_v_blocks_archive_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_archive" ADD CONSTRAINT "_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_availability" ADD CONSTRAINT "_pages_v_blocks_availability_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_slide_carousel_slides_pills" ADD CONSTRAINT "_pages_v_blocks_slide_carousel_slides_pills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_slide_carousel_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_slide_carousel_slides" ADD CONSTRAINT "_pages_v_blocks_slide_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_slide_carousel_slides" ADD CONSTRAINT "_pages_v_blocks_slide_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_slide_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_slide_carousel" ADD CONSTRAINT "_pages_v_blocks_slide_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_specialist_directory" ADD CONSTRAINT "_pages_v_blocks_specialist_directory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_specialty_directory" ADD CONSTRAINT "_pages_v_blocks_specialty_directory_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_resources_grid" ADD CONSTRAINT "_pages_v_blocks_resources_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_appt_guide_v_types_tabs_items" ADD CONSTRAINT "_appt_guide_v_types_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_appt_guide_v_types_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hcards_v_bullets" ADD CONSTRAINT "_hcards_v_bullets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hcards_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hcards_v" ADD CONSTRAINT "_hcards_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_appt_guide_v_types_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_appt_guide_v_types_tabs" ADD CONSTRAINT "_appt_guide_v_types_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_appt_guide_v_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_appt_guide_v_types" ADD CONSTRAINT "_appt_guide_v_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_appt_guide_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_appt_guide_v" ADD CONSTRAINT "_appt_guide_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_mission_pillars_pillars" ADD CONSTRAINT "_pages_v_blocks_mission_pillars_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_mission_pillars"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_mission_pillars" ADD CONSTRAINT "_pages_v_blocks_mission_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_value_cards_cards" ADD CONSTRAINT "_pages_v_blocks_value_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_value_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_value_cards" ADD CONSTRAINT "_pages_v_blocks_value_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_verify_items" ADD CONSTRAINT "_pages_v_blocks_why_verify_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_why_verify"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_verify" ADD CONSTRAINT "_pages_v_blocks_why_verify_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_verify" ADD CONSTRAINT "_pages_v_blocks_why_verify_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audience_pathways_pathways_steps" ADD CONSTRAINT "_pages_v_blocks_audience_pathways_pathways_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_audience_pathways_pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audience_pathways_pathways" ADD CONSTRAINT "_pages_v_blocks_audience_pathways_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_audience_pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_audience_pathways" ADD CONSTRAINT "_pages_v_blocks_audience_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bkchooser_v_halves_links" ADD CONSTRAINT "_bkchooser_v_halves_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_bkchooser_v_halves"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bkchooser_v_halves" ADD CONSTRAINT "_bkchooser_v_halves_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_bkchooser_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_bkchooser_v" ADD CONSTRAINT "_bkchooser_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cost_grid_cards" ADD CONSTRAINT "_pages_v_blocks_cost_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cost_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cost_grid" ADD CONSTRAINT "_pages_v_blocks_cost_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section_nav_items" ADD CONSTRAINT "_pages_v_blocks_section_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_section_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_section_nav" ADD CONSTRAINT "_pages_v_blocks_section_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_featured_articles" ADD CONSTRAINT "_pages_v_blocks_featured_articles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_events_explorer" ADD CONSTRAINT "_pages_v_blocks_events_explorer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_doc_id_pages_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_version_breadcrumbs" ADD CONSTRAINT "_pages_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_parent_id_pages_id_fk" FOREIGN KEY ("version_parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_attachments" ADD CONSTRAINT "posts_attachments_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_attachments" ADD CONSTRAINT "posts_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_populated_authors" ADD CONSTRAINT "posts_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_photo_id_media_id_fk" FOREIGN KEY ("author_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_stream_id_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."streams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_related_specialist_id_specialists_id_fk" FOREIGN KEY ("related_specialist_id") REFERENCES "public"."specialists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_attachments" ADD CONSTRAINT "_posts_v_version_attachments_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_version_attachments" ADD CONSTRAINT "_posts_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_populated_authors" ADD CONSTRAINT "_posts_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_photo_id_media_id_fk" FOREIGN KEY ("version_author_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_stream_id_streams_id_fk" FOREIGN KEY ("version_stream_id") REFERENCES "public"."streams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_specialty_id_specialties_id_fk" FOREIGN KEY ("version_specialty_id") REFERENCES "public"."specialties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_related_specialist_id_specialists_id_fk" FOREIGN KEY ("version_related_specialist_id") REFERENCES "public"."specialists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_gallery" ADD CONSTRAINT "events_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_gallery" ADD CONSTRAINT "events_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_attachments" ADD CONSTRAINT "events_attachments_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_attachments" ADD CONSTRAINT "events_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_guest_presenters" ADD CONSTRAINT "events_guest_presenters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_location_ref_id_locations_id_fk" FOREIGN KEY ("location_ref_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_event_type_id_event_types_id_fk" FOREIGN KEY ("event_type_id") REFERENCES "public"."event_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_gallery" ADD CONSTRAINT "_events_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_gallery" ADD CONSTRAINT "_events_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_attachments" ADD CONSTRAINT "_events_v_version_attachments_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_attachments" ADD CONSTRAINT "_events_v_version_attachments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_guest_presenters" ADD CONSTRAINT "_events_v_version_guest_presenters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_location_ref_id_locations_id_fk" FOREIGN KEY ("version_location_ref_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_event_type_id_event_types_id_fk" FOREIGN KEY ("version_event_type_id") REFERENCES "public"."event_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resources" ADD CONSTRAINT "resources_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "offices_hours" ADD CONSTRAINT "offices_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices_transport" ADD CONSTRAINT "offices_transport_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offices_parking" ADD CONSTRAINT "offices_parking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialties_key_areas" ADD CONSTRAINT "specialties_key_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."specialties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialties" ADD CONSTRAINT "specialties_category_id_specialty_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."specialty_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_breadcrumbs" ADD CONSTRAINT "categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "specialists_qualifications" ADD CONSTRAINT "specialists_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialists_languages" ADD CONSTRAINT "specialists_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialists" ADD CONSTRAINT "specialists_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "specialists" ADD CONSTRAINT "specialists_cv_id_media_id_fk" FOREIGN KEY ("cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "specialists" ADD CONSTRAINT "specialists_sample_report_id_media_id_fk" FOREIGN KEY ("sample_report_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "specialists" ADD CONSTRAINT "specialists_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "specialists" ADD CONSTRAINT "specialists_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "specialists_rels" ADD CONSTRAINT "specialists_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialists_rels" ADD CONSTRAINT "specialists_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialists_rels" ADD CONSTRAINT "specialists_rels_accreditations_fk" FOREIGN KEY ("accreditations_id") REFERENCES "public"."accreditations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialists_rels" ADD CONSTRAINT "specialists_rels_claim_types_fk" FOREIGN KEY ("claim_types_id") REFERENCES "public"."claim_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialists_rels" ADD CONSTRAINT "specialists_rels_assessment_types_fk" FOREIGN KEY ("assessment_types_id") REFERENCES "public"."assessment_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialists_rels" ADD CONSTRAINT "specialists_rels_areas_of_expertise_fk" FOREIGN KEY ("areas_of_expertise_id") REFERENCES "public"."areas_of_expertise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_specialists_v_version_qualifications" ADD CONSTRAINT "_specialists_v_version_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_specialists_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_specialists_v_version_languages" ADD CONSTRAINT "_specialists_v_version_languages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_specialists_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_specialists_v" ADD CONSTRAINT "_specialists_v_parent_id_specialists_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."specialists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_specialists_v" ADD CONSTRAINT "_specialists_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_specialists_v" ADD CONSTRAINT "_specialists_v_version_cv_id_media_id_fk" FOREIGN KEY ("version_cv_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_specialists_v" ADD CONSTRAINT "_specialists_v_version_sample_report_id_media_id_fk" FOREIGN KEY ("version_sample_report_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_specialists_v" ADD CONSTRAINT "_specialists_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_specialists_v" ADD CONSTRAINT "_specialists_v_version_specialty_id_specialties_id_fk" FOREIGN KEY ("version_specialty_id") REFERENCES "public"."specialties"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_specialists_v_rels" ADD CONSTRAINT "_specialists_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_specialists_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_specialists_v_rels" ADD CONSTRAINT "_specialists_v_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_specialists_v_rels" ADD CONSTRAINT "_specialists_v_rels_accreditations_fk" FOREIGN KEY ("accreditations_id") REFERENCES "public"."accreditations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_specialists_v_rels" ADD CONSTRAINT "_specialists_v_rels_claim_types_fk" FOREIGN KEY ("claim_types_id") REFERENCES "public"."claim_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_specialists_v_rels" ADD CONSTRAINT "_specialists_v_rels_assessment_types_fk" FOREIGN KEY ("assessment_types_id") REFERENCES "public"."assessment_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_specialists_v_rels" ADD CONSTRAINT "_specialists_v_rels_areas_of_expertise_fk" FOREIGN KEY ("areas_of_expertise_id") REFERENCES "public"."areas_of_expertise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_qualifications" ADD CONSTRAINT "team_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_sections" ADD CONSTRAINT "team_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_profile_photo_id_media_id_fk" FOREIGN KEY ("profile_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v_version_qualifications" ADD CONSTRAINT "_team_v_version_qualifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_v_version_sections" ADD CONSTRAINT "_team_v_version_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_parent_id_team_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_version_profile_photo_id_media_id_fk" FOREIGN KEY ("version_profile_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_v" ADD CONSTRAINT "_team_v_version_department_id_departments_id_fk" FOREIGN KEY ("version_department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "availability_sessions" ADD CONSTRAINT "availability_sessions_specialist_id_specialists_id_fk" FOREIGN KEY ("specialist_id") REFERENCES "public"."specialists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_checkbox" ADD CONSTRAINT "forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_email" ADD CONSTRAINT "forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_message" ADD CONSTRAINT "forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_number" ADD CONSTRAINT "forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select_options" ADD CONSTRAINT "forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_select" ADD CONSTRAINT "forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_state" ADD CONSTRAINT "forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_text" ADD CONSTRAINT "forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_textarea" ADD CONSTRAINT "forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_emails" ADD CONSTRAINT "forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions_submission_data" ADD CONSTRAINT "form_submissions_submission_data_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders_folder_type" ADD CONSTRAINT "payload_folders_folder_type_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_folders" ADD CONSTRAINT "payload_folders_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_offices_fk" FOREIGN KEY ("offices_id") REFERENCES "public"."offices"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_specialties_fk" FOREIGN KEY ("specialties_id") REFERENCES "public"."specialties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_specialty_categories_fk" FOREIGN KEY ("specialty_categories_id") REFERENCES "public"."specialty_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_claim_types_fk" FOREIGN KEY ("claim_types_id") REFERENCES "public"."claim_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_assessment_types_fk" FOREIGN KEY ("assessment_types_id") REFERENCES "public"."assessment_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_types_fk" FOREIGN KEY ("event_types_id") REFERENCES "public"."event_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_areas_of_expertise_fk" FOREIGN KEY ("areas_of_expertise_id") REFERENCES "public"."areas_of_expertise"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_accreditations_fk" FOREIGN KEY ("accreditations_id") REFERENCES "public"."accreditations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_streams_fk" FOREIGN KEY ("streams_id") REFERENCES "public"."streams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departments_fk" FOREIGN KEY ("departments_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_availability_sessions_fk" FOREIGN KEY ("availability_sessions_id") REFERENCES "public"."availability_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_icons_fk" FOREIGN KEY ("icons_id") REFERENCES "public"."icons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_form_submissions_fk" FOREIGN KEY ("form_submissions_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_folders_fk" FOREIGN KEY ("payload_folders_id") REFERENCES "public"."payload_folders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_settings_sidebar_cards" ADD CONSTRAINT "article_settings_sidebar_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_settings_rels" ADD CONSTRAINT "article_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."article_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_settings_rels" ADD CONSTRAINT "article_settings_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_settings_rels" ADD CONSTRAINT "article_settings_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_settings_rels" ADD CONSTRAINT "article_settings_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_settings_rels" ADD CONSTRAINT "article_settings_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_settings_rels" ADD CONSTRAINT "article_settings_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "specialist_profile_portal_cta_tiles" ADD CONSTRAINT "specialist_profile_portal_cta_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."specialist_profile"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_sub_items_sub_sub_items" ADD CONSTRAINT "header_nav_items_sub_items_sub_sub_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items_sub_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items_sub_items" ADD CONSTRAINT "header_nav_items_sub_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_hours" ADD CONSTRAINT "footer_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social" ADD CONSTRAINT "footer_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_specialists_fk" FOREIGN KEY ("specialists_id") REFERENCES "public"."specialists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_footer_id_media_id_fk" FOREIGN KEY ("logo_footer_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_shield_id_media_id_fk" FOREIGN KEY ("shield_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_social_image_id_media_id_fk" FOREIGN KEY ("social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_enquiry_form_id_forms_id_fk" FOREIGN KEY ("enquiry_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "custom_styles_presets" ADD CONSTRAINT "custom_styles_presets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."custom_styles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "icon_library_texts" ADD CONSTRAINT "icon_library_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."icon_library"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_meta_items_order_idx" ON "pages_hero_meta_items" USING btree ("_order");
  CREATE INDEX "pages_hero_meta_items_parent_id_idx" ON "pages_hero_meta_items" USING btree ("_parent_id");
  CREATE INDEX "pages_hero_links_order_idx" ON "pages_hero_links" USING btree ("_order");
  CREATE INDEX "pages_hero_links_parent_id_idx" ON "pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_heading_order_idx" ON "pages_blocks_heading" USING btree ("_order");
  CREATE INDEX "pages_blocks_heading_parent_id_idx" ON "pages_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_heading_path_idx" ON "pages_blocks_heading" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_order_idx" ON "pages_blocks_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_parent_id_idx" ON "pages_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_path_idx" ON "pages_blocks_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_button_links_order_idx" ON "pages_blocks_button_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_button_links_parent_id_idx" ON "pages_blocks_button_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_button_order_idx" ON "pages_blocks_button" USING btree ("_order");
  CREATE INDEX "pages_blocks_button_parent_id_idx" ON "pages_blocks_button" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_button_path_idx" ON "pages_blocks_button" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_media_idx" ON "pages_blocks_image" USING btree ("media_id");
  CREATE INDEX "pages_blocks_spacer_order_idx" ON "pages_blocks_spacer" USING btree ("_order");
  CREATE INDEX "pages_blocks_spacer_parent_id_idx" ON "pages_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_spacer_path_idx" ON "pages_blocks_spacer" USING btree ("_path");
  CREATE INDEX "pages_blocks_divider_order_idx" ON "pages_blocks_divider" USING btree ("_order");
  CREATE INDEX "pages_blocks_divider_parent_id_idx" ON "pages_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_divider_path_idx" ON "pages_blocks_divider" USING btree ("_path");
  CREATE INDEX "pages_blocks_icon_block_order_idx" ON "pages_blocks_icon_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_icon_block_parent_id_idx" ON "pages_blocks_icon_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_icon_block_path_idx" ON "pages_blocks_icon_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_items_order_idx" ON "pages_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_items_parent_id_idx" ON "pages_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_items_image_idx" ON "pages_blocks_faq_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_faq_order_idx" ON "pages_blocks_faq" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_parent_id_idx" ON "pages_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_path_idx" ON "pages_blocks_faq" USING btree ("_path");
  CREATE INDEX "pages_blocks_gateway_cards_cards_links_order_idx" ON "pages_blocks_gateway_cards_cards_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_gateway_cards_cards_links_parent_id_idx" ON "pages_blocks_gateway_cards_cards_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gateway_cards_cards_order_idx" ON "pages_blocks_gateway_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_gateway_cards_cards_parent_id_idx" ON "pages_blocks_gateway_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gateway_cards_order_idx" ON "pages_blocks_gateway_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_gateway_cards_parent_id_idx" ON "pages_blocks_gateway_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_gateway_cards_path_idx" ON "pages_blocks_gateway_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_grid_items_bullets_order_idx" ON "pages_blocks_feature_grid_items_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_items_bullets_parent_id_idx" ON "pages_blocks_feature_grid_items_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_items_details_order_idx" ON "pages_blocks_feature_grid_items_details" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_items_details_parent_id_idx" ON "pages_blocks_feature_grid_items_details" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_items_order_idx" ON "pages_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_items_parent_id_idx" ON "pages_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_order_idx" ON "pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_parent_id_idx" ON "pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_path_idx" ON "pages_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_process_steps_steps_bullets_order_idx" ON "pages_blocks_process_steps_steps_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_steps_bullets_parent_id_idx" ON "pages_blocks_process_steps_steps_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_steps_order_idx" ON "pages_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_steps_parent_id_idx" ON "pages_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_order_idx" ON "pages_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_parent_id_idx" ON "pages_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_path_idx" ON "pages_blocks_process_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_process_steps_image_idx" ON "pages_blocks_process_steps" USING btree ("image_id");
  CREATE INDEX "pages_blocks_specialty_grid_items_order_idx" ON "pages_blocks_specialty_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_specialty_grid_items_parent_id_idx" ON "pages_blocks_specialty_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_specialty_grid_order_idx" ON "pages_blocks_specialty_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_specialty_grid_parent_id_idx" ON "pages_blocks_specialty_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_specialty_grid_path_idx" ON "pages_blocks_specialty_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_people_grid_footer_links_order_idx" ON "pages_blocks_people_grid_footer_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_people_grid_footer_links_parent_id_idx" ON "pages_blocks_people_grid_footer_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_people_grid_order_idx" ON "pages_blocks_people_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_people_grid_parent_id_idx" ON "pages_blocks_people_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_people_grid_path_idx" ON "pages_blocks_people_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_people_grid_specialty_idx" ON "pages_blocks_people_grid" USING btree ("specialty_id");
  CREATE INDEX "pages_blocks_people_grid_location_idx" ON "pages_blocks_people_grid" USING btree ("location_id");
  CREATE INDEX "pages_blocks_people_grid_asmt_type_idx" ON "pages_blocks_people_grid" USING btree ("asmt_type_id");
  CREATE INDEX "pages_blocks_people_grid_department_idx" ON "pages_blocks_people_grid" USING btree ("department_id");
  CREATE INDEX "pages_blocks_services_grid_footer_links_order_idx" ON "pages_blocks_services_grid_footer_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_grid_footer_links_parent_id_idx" ON "pages_blocks_services_grid_footer_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_grid_order_idx" ON "pages_blocks_services_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_grid_parent_id_idx" ON "pages_blocks_services_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_grid_path_idx" ON "pages_blocks_services_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_grid_order_idx" ON "pages_blocks_testimonials_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_grid_parent_id_idx" ON "pages_blocks_testimonials_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_grid_path_idx" ON "pages_blocks_testimonials_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_stats_band_stats_order_idx" ON "pages_blocks_stats_band_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_band_stats_parent_id_idx" ON "pages_blocks_stats_band_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_band_order_idx" ON "pages_blocks_stats_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_stats_band_parent_id_idx" ON "pages_blocks_stats_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_stats_band_path_idx" ON "pages_blocks_stats_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_aamle_education_items_order_idx" ON "pages_blocks_aamle_education_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_aamle_education_items_parent_id_idx" ON "pages_blocks_aamle_education_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_aamle_education_order_idx" ON "pages_blocks_aamle_education" USING btree ("_order");
  CREATE INDEX "pages_blocks_aamle_education_parent_id_idx" ON "pages_blocks_aamle_education" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_aamle_education_path_idx" ON "pages_blocks_aamle_education" USING btree ("_path");
  CREATE INDEX "pages_blocks_aamle_education_image_idx" ON "pages_blocks_aamle_education" USING btree ("image_id");
  CREATE INDEX "pages_blocks_split_feature_rows_bullets_order_idx" ON "pages_blocks_split_feature_rows_bullets" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_feature_rows_bullets_parent_id_idx" ON "pages_blocks_split_feature_rows_bullets" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_feature_rows_order_idx" ON "pages_blocks_split_feature_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_feature_rows_parent_id_idx" ON "pages_blocks_split_feature_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_feature_rows_image_idx" ON "pages_blocks_split_feature_rows" USING btree ("image_id");
  CREATE INDEX "pages_blocks_split_feature_order_idx" ON "pages_blocks_split_feature" USING btree ("_order");
  CREATE INDEX "pages_blocks_split_feature_parent_id_idx" ON "pages_blocks_split_feature" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_split_feature_path_idx" ON "pages_blocks_split_feature" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_band_links_order_idx" ON "pages_blocks_cta_band_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_links_parent_id_idx" ON "pages_blocks_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_order_idx" ON "pages_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_band_parent_id_idx" ON "pages_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_band_path_idx" ON "pages_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_tabs_tabs_order_idx" ON "pages_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_tabs_parent_id_idx" ON "pages_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_order_idx" ON "pages_blocks_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_parent_id_idx" ON "pages_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_path_idx" ON "pages_blocks_tabs" USING btree ("_path");
  CREATE INDEX "pages_blocks_callout_links_order_idx" ON "pages_blocks_callout_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_links_parent_id_idx" ON "pages_blocks_callout_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_order_idx" ON "pages_blocks_callout" USING btree ("_order");
  CREATE INDEX "pages_blocks_callout_parent_id_idx" ON "pages_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_callout_path_idx" ON "pages_blocks_callout" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_details_items_order_idx" ON "pages_blocks_contact_details_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_details_items_parent_id_idx" ON "pages_blocks_contact_details_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_details_order_idx" ON "pages_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_details_parent_id_idx" ON "pages_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_details_path_idx" ON "pages_blocks_contact_details" USING btree ("_path");
  CREATE INDEX "pages_blocks_icon_list_items_order_idx" ON "pages_blocks_icon_list_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_icon_list_items_parent_id_idx" ON "pages_blocks_icon_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_icon_list_order_idx" ON "pages_blocks_icon_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_icon_list_parent_id_idx" ON "pages_blocks_icon_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_icon_list_path_idx" ON "pages_blocks_icon_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_map_embed_actions_order_idx" ON "pages_blocks_map_embed_actions" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_embed_actions_parent_id_idx" ON "pages_blocks_map_embed_actions" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_embed_order_idx" ON "pages_blocks_map_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_embed_parent_id_idx" ON "pages_blocks_map_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_embed_path_idx" ON "pages_blocks_map_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_map_embed_office_idx" ON "pages_blocks_map_embed" USING btree ("office_id");
  CREATE INDEX "pages_blocks_leadership_spotlight_credentials_order_idx" ON "pages_blocks_leadership_spotlight_credentials" USING btree ("_order");
  CREATE INDEX "pages_blocks_leadership_spotlight_credentials_parent_id_idx" ON "pages_blocks_leadership_spotlight_credentials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_leadership_spotlight_order_idx" ON "pages_blocks_leadership_spotlight" USING btree ("_order");
  CREATE INDEX "pages_blocks_leadership_spotlight_parent_id_idx" ON "pages_blocks_leadership_spotlight" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_leadership_spotlight_path_idx" ON "pages_blocks_leadership_spotlight" USING btree ("_path");
  CREATE INDEX "pages_blocks_leadership_spotlight_photo_idx" ON "pages_blocks_leadership_spotlight" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_portal_cta_tiles_order_idx" ON "pages_blocks_portal_cta_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_portal_cta_tiles_parent_id_idx" ON "pages_blocks_portal_cta_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portal_cta_links_order_idx" ON "pages_blocks_portal_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_portal_cta_links_parent_id_idx" ON "pages_blocks_portal_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portal_cta_order_idx" ON "pages_blocks_portal_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_portal_cta_parent_id_idx" ON "pages_blocks_portal_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portal_cta_path_idx" ON "pages_blocks_portal_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_video_embed_order_idx" ON "pages_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_video_embed_parent_id_idx" ON "pages_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_video_embed_path_idx" ON "pages_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_try_booking_order_idx" ON "pages_blocks_try_booking" USING btree ("_order");
  CREATE INDEX "pages_blocks_try_booking_parent_id_idx" ON "pages_blocks_try_booking" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_try_booking_path_idx" ON "pages_blocks_try_booking" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_blocks_row_columns_order_idx" ON "pages_blocks_row_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_row_columns_parent_id_idx" ON "pages_blocks_row_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_row_order_idx" ON "pages_blocks_row" USING btree ("_order");
  CREATE INDEX "pages_blocks_row_parent_id_idx" ON "pages_blocks_row" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_row_path_idx" ON "pages_blocks_row" USING btree ("_path");
  CREATE INDEX "pages_blocks_section_order_idx" ON "pages_blocks_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_parent_id_idx" ON "pages_blocks_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_path_idx" ON "pages_blocks_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_archive_order_idx" ON "pages_blocks_archive" USING btree ("_order");
  CREATE INDEX "pages_blocks_archive_parent_id_idx" ON "pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_archive_path_idx" ON "pages_blocks_archive" USING btree ("_path");
  CREATE INDEX "pages_blocks_archive_stream_idx" ON "pages_blocks_archive" USING btree ("stream_id");
  CREATE INDEX "pages_blocks_availability_order_idx" ON "pages_blocks_availability" USING btree ("_order");
  CREATE INDEX "pages_blocks_availability_parent_id_idx" ON "pages_blocks_availability" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_availability_path_idx" ON "pages_blocks_availability" USING btree ("_path");
  CREATE INDEX "pages_blocks_slide_carousel_slides_pills_order_idx" ON "pages_blocks_slide_carousel_slides_pills" USING btree ("_order");
  CREATE INDEX "pages_blocks_slide_carousel_slides_pills_parent_id_idx" ON "pages_blocks_slide_carousel_slides_pills" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_slide_carousel_slides_order_idx" ON "pages_blocks_slide_carousel_slides" USING btree ("_order");
  CREATE INDEX "pages_blocks_slide_carousel_slides_parent_id_idx" ON "pages_blocks_slide_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_slide_carousel_slides_image_idx" ON "pages_blocks_slide_carousel_slides" USING btree ("image_id");
  CREATE INDEX "pages_blocks_slide_carousel_order_idx" ON "pages_blocks_slide_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_slide_carousel_parent_id_idx" ON "pages_blocks_slide_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_slide_carousel_path_idx" ON "pages_blocks_slide_carousel" USING btree ("_path");
  CREATE INDEX "pages_blocks_specialist_directory_order_idx" ON "pages_blocks_specialist_directory" USING btree ("_order");
  CREATE INDEX "pages_blocks_specialist_directory_parent_id_idx" ON "pages_blocks_specialist_directory" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_specialist_directory_path_idx" ON "pages_blocks_specialist_directory" USING btree ("_path");
  CREATE INDEX "pages_blocks_specialty_directory_order_idx" ON "pages_blocks_specialty_directory" USING btree ("_order");
  CREATE INDEX "pages_blocks_specialty_directory_parent_id_idx" ON "pages_blocks_specialty_directory" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_specialty_directory_path_idx" ON "pages_blocks_specialty_directory" USING btree ("_path");
  CREATE INDEX "pages_blocks_resources_grid_order_idx" ON "pages_blocks_resources_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_resources_grid_parent_id_idx" ON "pages_blocks_resources_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_resources_grid_path_idx" ON "pages_blocks_resources_grid" USING btree ("_path");
  CREATE INDEX "appt_guide_types_tabs_items_order_idx" ON "appt_guide_types_tabs_items" USING btree ("_order");
  CREATE INDEX "appt_guide_types_tabs_items_parent_id_idx" ON "appt_guide_types_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "hcards_bullets_order_idx" ON "hcards_bullets" USING btree ("_order");
  CREATE INDEX "hcards_bullets_parent_id_idx" ON "hcards_bullets" USING btree ("_parent_id");
  CREATE INDEX "hcards_order_idx" ON "hcards" USING btree ("_order");
  CREATE INDEX "hcards_parent_id_idx" ON "hcards" USING btree ("_parent_id");
  CREATE INDEX "appt_guide_types_tabs_order_idx" ON "appt_guide_types_tabs" USING btree ("_order");
  CREATE INDEX "appt_guide_types_tabs_parent_id_idx" ON "appt_guide_types_tabs" USING btree ("_parent_id");
  CREATE INDEX "appt_guide_types_order_idx" ON "appt_guide_types" USING btree ("_order");
  CREATE INDEX "appt_guide_types_parent_id_idx" ON "appt_guide_types" USING btree ("_parent_id");
  CREATE INDEX "appt_guide_order_idx" ON "appt_guide" USING btree ("_order");
  CREATE INDEX "appt_guide_parent_id_idx" ON "appt_guide" USING btree ("_parent_id");
  CREATE INDEX "appt_guide_path_idx" ON "appt_guide" USING btree ("_path");
  CREATE INDEX "pages_blocks_mission_pillars_pillars_order_idx" ON "pages_blocks_mission_pillars_pillars" USING btree ("_order");
  CREATE INDEX "pages_blocks_mission_pillars_pillars_parent_id_idx" ON "pages_blocks_mission_pillars_pillars" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_mission_pillars_order_idx" ON "pages_blocks_mission_pillars" USING btree ("_order");
  CREATE INDEX "pages_blocks_mission_pillars_parent_id_idx" ON "pages_blocks_mission_pillars" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_mission_pillars_path_idx" ON "pages_blocks_mission_pillars" USING btree ("_path");
  CREATE INDEX "pages_blocks_value_cards_cards_order_idx" ON "pages_blocks_value_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_value_cards_cards_parent_id_idx" ON "pages_blocks_value_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_value_cards_order_idx" ON "pages_blocks_value_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_value_cards_parent_id_idx" ON "pages_blocks_value_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_value_cards_path_idx" ON "pages_blocks_value_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_why_verify_items_order_idx" ON "pages_blocks_why_verify_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_why_verify_items_parent_id_idx" ON "pages_blocks_why_verify_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_why_verify_order_idx" ON "pages_blocks_why_verify" USING btree ("_order");
  CREATE INDEX "pages_blocks_why_verify_parent_id_idx" ON "pages_blocks_why_verify" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_why_verify_path_idx" ON "pages_blocks_why_verify" USING btree ("_path");
  CREATE INDEX "pages_blocks_why_verify_image_idx" ON "pages_blocks_why_verify" USING btree ("image_id");
  CREATE INDEX "pages_blocks_audience_pathways_pathways_steps_order_idx" ON "pages_blocks_audience_pathways_pathways_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_audience_pathways_pathways_steps_parent_id_idx" ON "pages_blocks_audience_pathways_pathways_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_audience_pathways_pathways_order_idx" ON "pages_blocks_audience_pathways_pathways" USING btree ("_order");
  CREATE INDEX "pages_blocks_audience_pathways_pathways_parent_id_idx" ON "pages_blocks_audience_pathways_pathways" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_audience_pathways_order_idx" ON "pages_blocks_audience_pathways" USING btree ("_order");
  CREATE INDEX "pages_blocks_audience_pathways_parent_id_idx" ON "pages_blocks_audience_pathways" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_audience_pathways_path_idx" ON "pages_blocks_audience_pathways" USING btree ("_path");
  CREATE INDEX "bkchooser_halves_links_order_idx" ON "bkchooser_halves_links" USING btree ("_order");
  CREATE INDEX "bkchooser_halves_links_parent_id_idx" ON "bkchooser_halves_links" USING btree ("_parent_id");
  CREATE INDEX "bkchooser_halves_order_idx" ON "bkchooser_halves" USING btree ("_order");
  CREATE INDEX "bkchooser_halves_parent_id_idx" ON "bkchooser_halves" USING btree ("_parent_id");
  CREATE INDEX "bkchooser_order_idx" ON "bkchooser" USING btree ("_order");
  CREATE INDEX "bkchooser_parent_id_idx" ON "bkchooser" USING btree ("_parent_id");
  CREATE INDEX "bkchooser_path_idx" ON "bkchooser" USING btree ("_path");
  CREATE INDEX "pages_blocks_cost_grid_cards_order_idx" ON "pages_blocks_cost_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_cost_grid_cards_parent_id_idx" ON "pages_blocks_cost_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cost_grid_order_idx" ON "pages_blocks_cost_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_cost_grid_parent_id_idx" ON "pages_blocks_cost_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cost_grid_path_idx" ON "pages_blocks_cost_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_order_idx" ON "pages_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_parent_id_idx" ON "pages_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_path_idx" ON "pages_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_form_idx" ON "pages_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "pages_blocks_section_nav_items_order_idx" ON "pages_blocks_section_nav_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_nav_items_parent_id_idx" ON "pages_blocks_section_nav_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_nav_order_idx" ON "pages_blocks_section_nav" USING btree ("_order");
  CREATE INDEX "pages_blocks_section_nav_parent_id_idx" ON "pages_blocks_section_nav" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_section_nav_path_idx" ON "pages_blocks_section_nav" USING btree ("_path");
  CREATE INDEX "pages_blocks_featured_articles_order_idx" ON "pages_blocks_featured_articles" USING btree ("_order");
  CREATE INDEX "pages_blocks_featured_articles_parent_id_idx" ON "pages_blocks_featured_articles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_featured_articles_path_idx" ON "pages_blocks_featured_articles" USING btree ("_path");
  CREATE INDEX "pages_blocks_events_explorer_order_idx" ON "pages_blocks_events_explorer" USING btree ("_order");
  CREATE INDEX "pages_blocks_events_explorer_parent_id_idx" ON "pages_blocks_events_explorer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_events_explorer_path_idx" ON "pages_blocks_events_explorer" USING btree ("_path");
  CREATE INDEX "pages_breadcrumbs_order_idx" ON "pages_breadcrumbs" USING btree ("_order");
  CREATE INDEX "pages_breadcrumbs_parent_id_idx" ON "pages_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "pages_breadcrumbs_doc_idx" ON "pages_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "pages_hero_hero_media_idx" ON "pages" USING btree ("hero_media_id");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_parent_idx" ON "pages" USING btree ("parent_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_pages_id_idx" ON "pages_rels" USING btree ("pages_id");
  CREATE INDEX "pages_rels_posts_id_idx" ON "pages_rels" USING btree ("posts_id");
  CREATE INDEX "pages_rels_specialists_id_idx" ON "pages_rels" USING btree ("specialists_id");
  CREATE INDEX "pages_rels_team_id_idx" ON "pages_rels" USING btree ("team_id");
  CREATE INDEX "pages_rels_events_id_idx" ON "pages_rels" USING btree ("events_id");
  CREATE INDEX "pages_rels_services_id_idx" ON "pages_rels" USING btree ("services_id");
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "pages_rels_categories_id_idx" ON "pages_rels" USING btree ("categories_id");
  CREATE INDEX "pages_rels_resources_id_idx" ON "pages_rels" USING btree ("resources_id");
  CREATE INDEX "_pages_v_version_hero_meta_items_order_idx" ON "_pages_v_version_hero_meta_items" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_meta_items_parent_id_idx" ON "_pages_v_version_hero_meta_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_hero_links_order_idx" ON "_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_pages_v_version_hero_links_parent_id_idx" ON "_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_order_idx" ON "_pages_v_blocks_heading" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_heading_parent_id_idx" ON "_pages_v_blocks_heading" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_heading_path_idx" ON "_pages_v_blocks_heading" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_order_idx" ON "_pages_v_blocks_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_parent_id_idx" ON "_pages_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_path_idx" ON "_pages_v_blocks_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_button_links_order_idx" ON "_pages_v_blocks_button_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_button_links_parent_id_idx" ON "_pages_v_blocks_button_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_button_order_idx" ON "_pages_v_blocks_button" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_button_parent_id_idx" ON "_pages_v_blocks_button" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_button_path_idx" ON "_pages_v_blocks_button" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_media_idx" ON "_pages_v_blocks_image" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_spacer_order_idx" ON "_pages_v_blocks_spacer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_spacer_parent_id_idx" ON "_pages_v_blocks_spacer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_spacer_path_idx" ON "_pages_v_blocks_spacer" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_divider_order_idx" ON "_pages_v_blocks_divider" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_divider_parent_id_idx" ON "_pages_v_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_divider_path_idx" ON "_pages_v_blocks_divider" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_icon_block_order_idx" ON "_pages_v_blocks_icon_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_icon_block_parent_id_idx" ON "_pages_v_blocks_icon_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_icon_block_path_idx" ON "_pages_v_blocks_icon_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_order_idx" ON "_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_block_parent_id_idx" ON "_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_block_path_idx" ON "_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_block_media_idx" ON "_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_items_order_idx" ON "_pages_v_blocks_faq_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_items_parent_id_idx" ON "_pages_v_blocks_faq_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_items_image_idx" ON "_pages_v_blocks_faq_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_faq_order_idx" ON "_pages_v_blocks_faq" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_parent_id_idx" ON "_pages_v_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_path_idx" ON "_pages_v_blocks_faq" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_gateway_cards_cards_links_order_idx" ON "_pages_v_blocks_gateway_cards_cards_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gateway_cards_cards_links_parent_id_idx" ON "_pages_v_blocks_gateway_cards_cards_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gateway_cards_cards_order_idx" ON "_pages_v_blocks_gateway_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gateway_cards_cards_parent_id_idx" ON "_pages_v_blocks_gateway_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gateway_cards_order_idx" ON "_pages_v_blocks_gateway_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_gateway_cards_parent_id_idx" ON "_pages_v_blocks_gateway_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_gateway_cards_path_idx" ON "_pages_v_blocks_gateway_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_bullets_order_idx" ON "_pages_v_blocks_feature_grid_items_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_bullets_parent_id_idx" ON "_pages_v_blocks_feature_grid_items_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_details_order_idx" ON "_pages_v_blocks_feature_grid_items_details" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_details_parent_id_idx" ON "_pages_v_blocks_feature_grid_items_details" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_order_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_parent_id_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_order_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_parent_id_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_path_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_bullets_order_idx" ON "_pages_v_blocks_process_steps_steps_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_bullets_parent_id_idx" ON "_pages_v_blocks_process_steps_steps_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_order_idx" ON "_pages_v_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_parent_id_idx" ON "_pages_v_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_order_idx" ON "_pages_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_parent_id_idx" ON "_pages_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_path_idx" ON "_pages_v_blocks_process_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_process_steps_image_idx" ON "_pages_v_blocks_process_steps" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_specialty_grid_items_order_idx" ON "_pages_v_blocks_specialty_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_specialty_grid_items_parent_id_idx" ON "_pages_v_blocks_specialty_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_specialty_grid_order_idx" ON "_pages_v_blocks_specialty_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_specialty_grid_parent_id_idx" ON "_pages_v_blocks_specialty_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_specialty_grid_path_idx" ON "_pages_v_blocks_specialty_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_people_grid_footer_links_order_idx" ON "_pages_v_blocks_people_grid_footer_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_people_grid_footer_links_parent_id_idx" ON "_pages_v_blocks_people_grid_footer_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_people_grid_order_idx" ON "_pages_v_blocks_people_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_people_grid_parent_id_idx" ON "_pages_v_blocks_people_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_people_grid_path_idx" ON "_pages_v_blocks_people_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_people_grid_specialty_idx" ON "_pages_v_blocks_people_grid" USING btree ("specialty_id");
  CREATE INDEX "_pages_v_blocks_people_grid_location_idx" ON "_pages_v_blocks_people_grid" USING btree ("location_id");
  CREATE INDEX "_pages_v_blocks_people_grid_asmt_type_idx" ON "_pages_v_blocks_people_grid" USING btree ("asmt_type_id");
  CREATE INDEX "_pages_v_blocks_people_grid_department_idx" ON "_pages_v_blocks_people_grid" USING btree ("department_id");
  CREATE INDEX "_pages_v_blocks_services_grid_footer_links_order_idx" ON "_pages_v_blocks_services_grid_footer_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_grid_footer_links_parent_id_idx" ON "_pages_v_blocks_services_grid_footer_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_grid_order_idx" ON "_pages_v_blocks_services_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_grid_parent_id_idx" ON "_pages_v_blocks_services_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_grid_path_idx" ON "_pages_v_blocks_services_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_grid_order_idx" ON "_pages_v_blocks_testimonials_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_grid_parent_id_idx" ON "_pages_v_blocks_testimonials_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_grid_path_idx" ON "_pages_v_blocks_testimonials_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_stats_band_stats_order_idx" ON "_pages_v_blocks_stats_band_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_band_stats_parent_id_idx" ON "_pages_v_blocks_stats_band_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_band_order_idx" ON "_pages_v_blocks_stats_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_stats_band_parent_id_idx" ON "_pages_v_blocks_stats_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_stats_band_path_idx" ON "_pages_v_blocks_stats_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_aamle_education_items_order_idx" ON "_pages_v_blocks_aamle_education_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_aamle_education_items_parent_id_idx" ON "_pages_v_blocks_aamle_education_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_aamle_education_order_idx" ON "_pages_v_blocks_aamle_education" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_aamle_education_parent_id_idx" ON "_pages_v_blocks_aamle_education" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_aamle_education_path_idx" ON "_pages_v_blocks_aamle_education" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_aamle_education_image_idx" ON "_pages_v_blocks_aamle_education" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_split_feature_rows_bullets_order_idx" ON "_pages_v_blocks_split_feature_rows_bullets" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_feature_rows_bullets_parent_id_idx" ON "_pages_v_blocks_split_feature_rows_bullets" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_split_feature_rows_order_idx" ON "_pages_v_blocks_split_feature_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_feature_rows_parent_id_idx" ON "_pages_v_blocks_split_feature_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_split_feature_rows_image_idx" ON "_pages_v_blocks_split_feature_rows" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_split_feature_order_idx" ON "_pages_v_blocks_split_feature" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_split_feature_parent_id_idx" ON "_pages_v_blocks_split_feature" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_split_feature_path_idx" ON "_pages_v_blocks_split_feature" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_band_links_order_idx" ON "_pages_v_blocks_cta_band_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_links_parent_id_idx" ON "_pages_v_blocks_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_order_idx" ON "_pages_v_blocks_cta_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_band_parent_id_idx" ON "_pages_v_blocks_cta_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_band_path_idx" ON "_pages_v_blocks_cta_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tabs_tabs_order_idx" ON "_pages_v_blocks_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_tabs_parent_id_idx" ON "_pages_v_blocks_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_order_idx" ON "_pages_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_parent_id_idx" ON "_pages_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_path_idx" ON "_pages_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_callout_links_order_idx" ON "_pages_v_blocks_callout_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_links_parent_id_idx" ON "_pages_v_blocks_callout_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_order_idx" ON "_pages_v_blocks_callout" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_callout_parent_id_idx" ON "_pages_v_blocks_callout" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_callout_path_idx" ON "_pages_v_blocks_callout" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_details_items_order_idx" ON "_pages_v_blocks_contact_details_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_details_items_parent_id_idx" ON "_pages_v_blocks_contact_details_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_details_order_idx" ON "_pages_v_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_details_parent_id_idx" ON "_pages_v_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_details_path_idx" ON "_pages_v_blocks_contact_details" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_icon_list_items_order_idx" ON "_pages_v_blocks_icon_list_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_icon_list_items_parent_id_idx" ON "_pages_v_blocks_icon_list_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_icon_list_order_idx" ON "_pages_v_blocks_icon_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_icon_list_parent_id_idx" ON "_pages_v_blocks_icon_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_icon_list_path_idx" ON "_pages_v_blocks_icon_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_map_embed_actions_order_idx" ON "_pages_v_blocks_map_embed_actions" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_embed_actions_parent_id_idx" ON "_pages_v_blocks_map_embed_actions" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_embed_order_idx" ON "_pages_v_blocks_map_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_embed_parent_id_idx" ON "_pages_v_blocks_map_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_embed_path_idx" ON "_pages_v_blocks_map_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_map_embed_office_idx" ON "_pages_v_blocks_map_embed" USING btree ("office_id");
  CREATE INDEX "_pages_v_blocks_leadership_spotlight_credentials_order_idx" ON "_pages_v_blocks_leadership_spotlight_credentials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_leadership_spotlight_credentials_parent_id_idx" ON "_pages_v_blocks_leadership_spotlight_credentials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_leadership_spotlight_order_idx" ON "_pages_v_blocks_leadership_spotlight" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_leadership_spotlight_parent_id_idx" ON "_pages_v_blocks_leadership_spotlight" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_leadership_spotlight_path_idx" ON "_pages_v_blocks_leadership_spotlight" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_leadership_spotlight_photo_idx" ON "_pages_v_blocks_leadership_spotlight" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_portal_cta_tiles_order_idx" ON "_pages_v_blocks_portal_cta_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_portal_cta_tiles_parent_id_idx" ON "_pages_v_blocks_portal_cta_tiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_portal_cta_links_order_idx" ON "_pages_v_blocks_portal_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_portal_cta_links_parent_id_idx" ON "_pages_v_blocks_portal_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_portal_cta_order_idx" ON "_pages_v_blocks_portal_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_portal_cta_parent_id_idx" ON "_pages_v_blocks_portal_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_portal_cta_path_idx" ON "_pages_v_blocks_portal_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_video_embed_order_idx" ON "_pages_v_blocks_video_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_video_embed_parent_id_idx" ON "_pages_v_blocks_video_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_video_embed_path_idx" ON "_pages_v_blocks_video_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_try_booking_order_idx" ON "_pages_v_blocks_try_booking" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_try_booking_parent_id_idx" ON "_pages_v_blocks_try_booking" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_try_booking_path_idx" ON "_pages_v_blocks_try_booking" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_row_columns_order_idx" ON "_pages_v_blocks_row_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_row_columns_parent_id_idx" ON "_pages_v_blocks_row_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_row_order_idx" ON "_pages_v_blocks_row" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_row_parent_id_idx" ON "_pages_v_blocks_row" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_row_path_idx" ON "_pages_v_blocks_row" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_section_order_idx" ON "_pages_v_blocks_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_section_parent_id_idx" ON "_pages_v_blocks_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_section_path_idx" ON "_pages_v_blocks_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_archive_order_idx" ON "_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_archive_parent_id_idx" ON "_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_archive_path_idx" ON "_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_archive_stream_idx" ON "_pages_v_blocks_archive" USING btree ("stream_id");
  CREATE INDEX "_pages_v_blocks_availability_order_idx" ON "_pages_v_blocks_availability" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_availability_parent_id_idx" ON "_pages_v_blocks_availability" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_availability_path_idx" ON "_pages_v_blocks_availability" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_slide_carousel_slides_pills_order_idx" ON "_pages_v_blocks_slide_carousel_slides_pills" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_slide_carousel_slides_pills_parent_id_idx" ON "_pages_v_blocks_slide_carousel_slides_pills" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_slide_carousel_slides_order_idx" ON "_pages_v_blocks_slide_carousel_slides" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_slide_carousel_slides_parent_id_idx" ON "_pages_v_blocks_slide_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_slide_carousel_slides_image_idx" ON "_pages_v_blocks_slide_carousel_slides" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_slide_carousel_order_idx" ON "_pages_v_blocks_slide_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_slide_carousel_parent_id_idx" ON "_pages_v_blocks_slide_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_slide_carousel_path_idx" ON "_pages_v_blocks_slide_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_specialist_directory_order_idx" ON "_pages_v_blocks_specialist_directory" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_specialist_directory_parent_id_idx" ON "_pages_v_blocks_specialist_directory" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_specialist_directory_path_idx" ON "_pages_v_blocks_specialist_directory" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_specialty_directory_order_idx" ON "_pages_v_blocks_specialty_directory" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_specialty_directory_parent_id_idx" ON "_pages_v_blocks_specialty_directory" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_specialty_directory_path_idx" ON "_pages_v_blocks_specialty_directory" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_resources_grid_order_idx" ON "_pages_v_blocks_resources_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_resources_grid_parent_id_idx" ON "_pages_v_blocks_resources_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_resources_grid_path_idx" ON "_pages_v_blocks_resources_grid" USING btree ("_path");
  CREATE INDEX "_appt_guide_v_types_tabs_items_order_idx" ON "_appt_guide_v_types_tabs_items" USING btree ("_order");
  CREATE INDEX "_appt_guide_v_types_tabs_items_parent_id_idx" ON "_appt_guide_v_types_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_hcards_v_bullets_order_idx" ON "_hcards_v_bullets" USING btree ("_order");
  CREATE INDEX "_hcards_v_bullets_parent_id_idx" ON "_hcards_v_bullets" USING btree ("_parent_id");
  CREATE INDEX "_hcards_v_order_idx" ON "_hcards_v" USING btree ("_order");
  CREATE INDEX "_hcards_v_parent_id_idx" ON "_hcards_v" USING btree ("_parent_id");
  CREATE INDEX "_appt_guide_v_types_tabs_order_idx" ON "_appt_guide_v_types_tabs" USING btree ("_order");
  CREATE INDEX "_appt_guide_v_types_tabs_parent_id_idx" ON "_appt_guide_v_types_tabs" USING btree ("_parent_id");
  CREATE INDEX "_appt_guide_v_types_order_idx" ON "_appt_guide_v_types" USING btree ("_order");
  CREATE INDEX "_appt_guide_v_types_parent_id_idx" ON "_appt_guide_v_types" USING btree ("_parent_id");
  CREATE INDEX "_appt_guide_v_order_idx" ON "_appt_guide_v" USING btree ("_order");
  CREATE INDEX "_appt_guide_v_parent_id_idx" ON "_appt_guide_v" USING btree ("_parent_id");
  CREATE INDEX "_appt_guide_v_path_idx" ON "_appt_guide_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_mission_pillars_pillars_order_idx" ON "_pages_v_blocks_mission_pillars_pillars" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_mission_pillars_pillars_parent_id_idx" ON "_pages_v_blocks_mission_pillars_pillars" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_mission_pillars_order_idx" ON "_pages_v_blocks_mission_pillars" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_mission_pillars_parent_id_idx" ON "_pages_v_blocks_mission_pillars" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_mission_pillars_path_idx" ON "_pages_v_blocks_mission_pillars" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_value_cards_cards_order_idx" ON "_pages_v_blocks_value_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_value_cards_cards_parent_id_idx" ON "_pages_v_blocks_value_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_value_cards_order_idx" ON "_pages_v_blocks_value_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_value_cards_parent_id_idx" ON "_pages_v_blocks_value_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_value_cards_path_idx" ON "_pages_v_blocks_value_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_why_verify_items_order_idx" ON "_pages_v_blocks_why_verify_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_why_verify_items_parent_id_idx" ON "_pages_v_blocks_why_verify_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_why_verify_order_idx" ON "_pages_v_blocks_why_verify" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_why_verify_parent_id_idx" ON "_pages_v_blocks_why_verify" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_why_verify_path_idx" ON "_pages_v_blocks_why_verify" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_why_verify_image_idx" ON "_pages_v_blocks_why_verify" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_audience_pathways_pathways_steps_order_idx" ON "_pages_v_blocks_audience_pathways_pathways_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_audience_pathways_pathways_steps_parent_id_idx" ON "_pages_v_blocks_audience_pathways_pathways_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_audience_pathways_pathways_order_idx" ON "_pages_v_blocks_audience_pathways_pathways" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_audience_pathways_pathways_parent_id_idx" ON "_pages_v_blocks_audience_pathways_pathways" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_audience_pathways_order_idx" ON "_pages_v_blocks_audience_pathways" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_audience_pathways_parent_id_idx" ON "_pages_v_blocks_audience_pathways" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_audience_pathways_path_idx" ON "_pages_v_blocks_audience_pathways" USING btree ("_path");
  CREATE INDEX "_bkchooser_v_halves_links_order_idx" ON "_bkchooser_v_halves_links" USING btree ("_order");
  CREATE INDEX "_bkchooser_v_halves_links_parent_id_idx" ON "_bkchooser_v_halves_links" USING btree ("_parent_id");
  CREATE INDEX "_bkchooser_v_halves_order_idx" ON "_bkchooser_v_halves" USING btree ("_order");
  CREATE INDEX "_bkchooser_v_halves_parent_id_idx" ON "_bkchooser_v_halves" USING btree ("_parent_id");
  CREATE INDEX "_bkchooser_v_order_idx" ON "_bkchooser_v" USING btree ("_order");
  CREATE INDEX "_bkchooser_v_parent_id_idx" ON "_bkchooser_v" USING btree ("_parent_id");
  CREATE INDEX "_bkchooser_v_path_idx" ON "_bkchooser_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cost_grid_cards_order_idx" ON "_pages_v_blocks_cost_grid_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cost_grid_cards_parent_id_idx" ON "_pages_v_blocks_cost_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cost_grid_order_idx" ON "_pages_v_blocks_cost_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cost_grid_parent_id_idx" ON "_pages_v_blocks_cost_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cost_grid_path_idx" ON "_pages_v_blocks_cost_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_order_idx" ON "_pages_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_parent_id_idx" ON "_pages_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_path_idx" ON "_pages_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_form_idx" ON "_pages_v_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_section_nav_items_order_idx" ON "_pages_v_blocks_section_nav_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_section_nav_items_parent_id_idx" ON "_pages_v_blocks_section_nav_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_section_nav_order_idx" ON "_pages_v_blocks_section_nav" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_section_nav_parent_id_idx" ON "_pages_v_blocks_section_nav" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_section_nav_path_idx" ON "_pages_v_blocks_section_nav" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_featured_articles_order_idx" ON "_pages_v_blocks_featured_articles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_featured_articles_parent_id_idx" ON "_pages_v_blocks_featured_articles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_featured_articles_path_idx" ON "_pages_v_blocks_featured_articles" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_events_explorer_order_idx" ON "_pages_v_blocks_events_explorer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_events_explorer_parent_id_idx" ON "_pages_v_blocks_events_explorer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_events_explorer_path_idx" ON "_pages_v_blocks_events_explorer" USING btree ("_path");
  CREATE INDEX "_pages_v_version_breadcrumbs_order_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX "_pages_v_version_breadcrumbs_parent_id_idx" ON "_pages_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_version_breadcrumbs_doc_idx" ON "_pages_v_version_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_hero_version_hero_media_idx" ON "_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_parent_idx" ON "_pages_v" USING btree ("version_parent_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_pages_id_idx" ON "_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_pages_v_rels_posts_id_idx" ON "_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_pages_v_rels_specialists_id_idx" ON "_pages_v_rels" USING btree ("specialists_id");
  CREATE INDEX "_pages_v_rels_team_id_idx" ON "_pages_v_rels" USING btree ("team_id");
  CREATE INDEX "_pages_v_rels_events_id_idx" ON "_pages_v_rels" USING btree ("events_id");
  CREATE INDEX "_pages_v_rels_services_id_idx" ON "_pages_v_rels" USING btree ("services_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_rels_categories_id_idx" ON "_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "_pages_v_rels_resources_id_idx" ON "_pages_v_rels" USING btree ("resources_id");
  CREATE INDEX "posts_attachments_order_idx" ON "posts_attachments" USING btree ("_order");
  CREATE INDEX "posts_attachments_parent_id_idx" ON "posts_attachments" USING btree ("_parent_id");
  CREATE INDEX "posts_attachments_file_idx" ON "posts_attachments" USING btree ("file_id");
  CREATE INDEX "posts_populated_authors_order_idx" ON "posts_populated_authors" USING btree ("_order");
  CREATE INDEX "posts_populated_authors_parent_id_idx" ON "posts_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "posts_hero_image_idx" ON "posts" USING btree ("hero_image_id");
  CREATE INDEX "posts_author_author_photo_idx" ON "posts" USING btree ("author_photo_id");
  CREATE INDEX "posts_stream_idx" ON "posts" USING btree ("stream_id");
  CREATE INDEX "posts_specialty_idx" ON "posts" USING btree ("specialty_id");
  CREATE INDEX "posts_related_specialist_idx" ON "posts" USING btree ("related_specialist_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_team_id_idx" ON "posts_rels" USING btree ("team_id");
  CREATE INDEX "posts_rels_specialists_id_idx" ON "posts_rels" USING btree ("specialists_id");
  CREATE INDEX "posts_rels_posts_id_idx" ON "posts_rels" USING btree ("posts_id");
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "posts_rels_users_id_idx" ON "posts_rels" USING btree ("users_id");
  CREATE INDEX "_posts_v_version_attachments_order_idx" ON "_posts_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_posts_v_version_attachments_parent_id_idx" ON "_posts_v_version_attachments" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_attachments_file_idx" ON "_posts_v_version_attachments" USING btree ("file_id");
  CREATE INDEX "_posts_v_version_populated_authors_order_idx" ON "_posts_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_posts_v_version_populated_authors_parent_id_idx" ON "_posts_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_hero_image_idx" ON "_posts_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_posts_v_version_author_version_author_photo_idx" ON "_posts_v" USING btree ("version_author_photo_id");
  CREATE INDEX "_posts_v_version_version_stream_idx" ON "_posts_v" USING btree ("version_stream_id");
  CREATE INDEX "_posts_v_version_version_specialty_idx" ON "_posts_v" USING btree ("version_specialty_id");
  CREATE INDEX "_posts_v_version_version_related_specialist_idx" ON "_posts_v" USING btree ("version_related_specialist_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "_posts_v_autosave_idx" ON "_posts_v" USING btree ("autosave");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_team_id_idx" ON "_posts_v_rels" USING btree ("team_id");
  CREATE INDEX "_posts_v_rels_specialists_id_idx" ON "_posts_v_rels" USING btree ("specialists_id");
  CREATE INDEX "_posts_v_rels_posts_id_idx" ON "_posts_v_rels" USING btree ("posts_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_users_id_idx" ON "_posts_v_rels" USING btree ("users_id");
  CREATE INDEX "events_gallery_order_idx" ON "events_gallery" USING btree ("_order");
  CREATE INDEX "events_gallery_parent_id_idx" ON "events_gallery" USING btree ("_parent_id");
  CREATE INDEX "events_gallery_image_idx" ON "events_gallery" USING btree ("image_id");
  CREATE INDEX "events_attachments_order_idx" ON "events_attachments" USING btree ("_order");
  CREATE INDEX "events_attachments_parent_id_idx" ON "events_attachments" USING btree ("_parent_id");
  CREATE INDEX "events_attachments_file_idx" ON "events_attachments" USING btree ("file_id");
  CREATE INDEX "events_guest_presenters_order_idx" ON "events_guest_presenters" USING btree ("_order");
  CREATE INDEX "events_guest_presenters_parent_id_idx" ON "events_guest_presenters" USING btree ("_parent_id");
  CREATE INDEX "events_location_ref_idx" ON "events" USING btree ("location_ref_id");
  CREATE INDEX "events_image_idx" ON "events" USING btree ("image_id");
  CREATE INDEX "events_meta_meta_image_idx" ON "events" USING btree ("meta_image_id");
  CREATE INDEX "events_event_type_idx" ON "events" USING btree ("event_type_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_specialists_id_idx" ON "events_rels" USING btree ("specialists_id");
  CREATE INDEX "events_rels_team_id_idx" ON "events_rels" USING btree ("team_id");
  CREATE INDEX "_events_v_version_gallery_order_idx" ON "_events_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_events_v_version_gallery_parent_id_idx" ON "_events_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_gallery_image_idx" ON "_events_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_events_v_version_attachments_order_idx" ON "_events_v_version_attachments" USING btree ("_order");
  CREATE INDEX "_events_v_version_attachments_parent_id_idx" ON "_events_v_version_attachments" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_attachments_file_idx" ON "_events_v_version_attachments" USING btree ("file_id");
  CREATE INDEX "_events_v_version_guest_presenters_order_idx" ON "_events_v_version_guest_presenters" USING btree ("_order");
  CREATE INDEX "_events_v_version_guest_presenters_parent_id_idx" ON "_events_v_version_guest_presenters" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_location_ref_idx" ON "_events_v" USING btree ("version_location_ref_id");
  CREATE INDEX "_events_v_version_version_image_idx" ON "_events_v" USING btree ("version_image_id");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_events_v_version_version_event_type_idx" ON "_events_v" USING btree ("version_event_type_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_specialists_id_idx" ON "_events_v_rels" USING btree ("specialists_id");
  CREATE INDEX "_events_v_rels_team_id_idx" ON "_events_v_rels" USING btree ("team_id");
  CREATE INDEX "services_photo_idx" ON "services" USING btree ("photo_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "resources_file_idx" ON "resources" USING btree ("file_id");
  CREATE UNIQUE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE INDEX "offices_hours_order_idx" ON "offices_hours" USING btree ("_order");
  CREATE INDEX "offices_hours_parent_id_idx" ON "offices_hours" USING btree ("_parent_id");
  CREATE INDEX "offices_transport_order_idx" ON "offices_transport" USING btree ("_order");
  CREATE INDEX "offices_transport_parent_id_idx" ON "offices_transport" USING btree ("_parent_id");
  CREATE INDEX "offices_parking_order_idx" ON "offices_parking" USING btree ("_order");
  CREATE INDEX "offices_parking_parent_id_idx" ON "offices_parking" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "offices_slug_idx" ON "offices" USING btree ("slug");
  CREATE INDEX "offices_updated_at_idx" ON "offices" USING btree ("updated_at");
  CREATE INDEX "offices_created_at_idx" ON "offices" USING btree ("created_at");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "specialties_key_areas_order_idx" ON "specialties_key_areas" USING btree ("_order");
  CREATE INDEX "specialties_key_areas_parent_id_idx" ON "specialties_key_areas" USING btree ("_parent_id");
  CREATE INDEX "specialties_category_idx" ON "specialties" USING btree ("category_id");
  CREATE UNIQUE INDEX "specialties_slug_idx" ON "specialties" USING btree ("slug");
  CREATE INDEX "specialties_updated_at_idx" ON "specialties" USING btree ("updated_at");
  CREATE INDEX "specialties_created_at_idx" ON "specialties" USING btree ("created_at");
  CREATE UNIQUE INDEX "specialty_categories_slug_idx" ON "specialty_categories" USING btree ("slug");
  CREATE INDEX "specialty_categories_updated_at_idx" ON "specialty_categories" USING btree ("updated_at");
  CREATE INDEX "specialty_categories_created_at_idx" ON "specialty_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "claim_types_slug_idx" ON "claim_types" USING btree ("slug");
  CREATE INDEX "claim_types_updated_at_idx" ON "claim_types" USING btree ("updated_at");
  CREATE INDEX "claim_types_created_at_idx" ON "claim_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "assessment_types_slug_idx" ON "assessment_types" USING btree ("slug");
  CREATE INDEX "assessment_types_updated_at_idx" ON "assessment_types" USING btree ("updated_at");
  CREATE INDEX "assessment_types_created_at_idx" ON "assessment_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "event_types_slug_idx" ON "event_types" USING btree ("slug");
  CREATE INDEX "event_types_updated_at_idx" ON "event_types" USING btree ("updated_at");
  CREATE INDEX "event_types_created_at_idx" ON "event_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "areas_of_expertise_slug_idx" ON "areas_of_expertise" USING btree ("slug");
  CREATE INDEX "areas_of_expertise_updated_at_idx" ON "areas_of_expertise" USING btree ("updated_at");
  CREATE INDEX "areas_of_expertise_created_at_idx" ON "areas_of_expertise" USING btree ("created_at");
  CREATE UNIQUE INDEX "accreditations_slug_idx" ON "accreditations" USING btree ("slug");
  CREATE INDEX "accreditations_updated_at_idx" ON "accreditations" USING btree ("updated_at");
  CREATE INDEX "accreditations_created_at_idx" ON "accreditations" USING btree ("created_at");
  CREATE UNIQUE INDEX "locations_slug_idx" ON "locations" USING btree ("slug");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  CREATE UNIQUE INDEX "streams_slug_idx" ON "streams" USING btree ("slug");
  CREATE INDEX "streams_updated_at_idx" ON "streams" USING btree ("updated_at");
  CREATE INDEX "streams_created_at_idx" ON "streams" USING btree ("created_at");
  CREATE INDEX "categories_breadcrumbs_order_idx" ON "categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX "categories_breadcrumbs_parent_id_idx" ON "categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX "categories_breadcrumbs_doc_idx" ON "categories_breadcrumbs" USING btree ("doc_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_parent_idx" ON "categories" USING btree ("parent_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "departments_slug_idx" ON "departments" USING btree ("slug");
  CREATE INDEX "departments_updated_at_idx" ON "departments" USING btree ("updated_at");
  CREATE INDEX "departments_created_at_idx" ON "departments" USING btree ("created_at");
  CREATE INDEX "specialists_qualifications_order_idx" ON "specialists_qualifications" USING btree ("_order");
  CREATE INDEX "specialists_qualifications_parent_id_idx" ON "specialists_qualifications" USING btree ("_parent_id");
  CREATE INDEX "specialists_languages_order_idx" ON "specialists_languages" USING btree ("_order");
  CREATE INDEX "specialists_languages_parent_id_idx" ON "specialists_languages" USING btree ("_parent_id");
  CREATE INDEX "specialists__order_idx" ON "specialists" USING btree ("_order");
  CREATE INDEX "specialists_photo_idx" ON "specialists" USING btree ("photo_id");
  CREATE INDEX "specialists_cv_idx" ON "specialists" USING btree ("cv_id");
  CREATE INDEX "specialists_sample_report_idx" ON "specialists" USING btree ("sample_report_id");
  CREATE INDEX "specialists_meta_meta_image_idx" ON "specialists" USING btree ("meta_image_id");
  CREATE INDEX "specialists_specialty_idx" ON "specialists" USING btree ("specialty_id");
  CREATE UNIQUE INDEX "specialists_slug_idx" ON "specialists" USING btree ("slug");
  CREATE INDEX "specialists_updated_at_idx" ON "specialists" USING btree ("updated_at");
  CREATE INDEX "specialists_created_at_idx" ON "specialists" USING btree ("created_at");
  CREATE INDEX "specialists__status_idx" ON "specialists" USING btree ("_status");
  CREATE INDEX "specialists_rels_order_idx" ON "specialists_rels" USING btree ("order");
  CREATE INDEX "specialists_rels_parent_idx" ON "specialists_rels" USING btree ("parent_id");
  CREATE INDEX "specialists_rels_path_idx" ON "specialists_rels" USING btree ("path");
  CREATE INDEX "specialists_rels_locations_id_idx" ON "specialists_rels" USING btree ("locations_id");
  CREATE INDEX "specialists_rels_accreditations_id_idx" ON "specialists_rels" USING btree ("accreditations_id");
  CREATE INDEX "specialists_rels_claim_types_id_idx" ON "specialists_rels" USING btree ("claim_types_id");
  CREATE INDEX "specialists_rels_assessment_types_id_idx" ON "specialists_rels" USING btree ("assessment_types_id");
  CREATE INDEX "specialists_rels_areas_of_expertise_id_idx" ON "specialists_rels" USING btree ("areas_of_expertise_id");
  CREATE INDEX "_specialists_v_version_qualifications_order_idx" ON "_specialists_v_version_qualifications" USING btree ("_order");
  CREATE INDEX "_specialists_v_version_qualifications_parent_id_idx" ON "_specialists_v_version_qualifications" USING btree ("_parent_id");
  CREATE INDEX "_specialists_v_version_languages_order_idx" ON "_specialists_v_version_languages" USING btree ("_order");
  CREATE INDEX "_specialists_v_version_languages_parent_id_idx" ON "_specialists_v_version_languages" USING btree ("_parent_id");
  CREATE INDEX "_specialists_v_parent_idx" ON "_specialists_v" USING btree ("parent_id");
  CREATE INDEX "_specialists_v_version_version__order_idx" ON "_specialists_v" USING btree ("version__order");
  CREATE INDEX "_specialists_v_version_version_photo_idx" ON "_specialists_v" USING btree ("version_photo_id");
  CREATE INDEX "_specialists_v_version_version_cv_idx" ON "_specialists_v" USING btree ("version_cv_id");
  CREATE INDEX "_specialists_v_version_version_sample_report_idx" ON "_specialists_v" USING btree ("version_sample_report_id");
  CREATE INDEX "_specialists_v_version_meta_version_meta_image_idx" ON "_specialists_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_specialists_v_version_version_specialty_idx" ON "_specialists_v" USING btree ("version_specialty_id");
  CREATE INDEX "_specialists_v_version_version_slug_idx" ON "_specialists_v" USING btree ("version_slug");
  CREATE INDEX "_specialists_v_version_version_updated_at_idx" ON "_specialists_v" USING btree ("version_updated_at");
  CREATE INDEX "_specialists_v_version_version_created_at_idx" ON "_specialists_v" USING btree ("version_created_at");
  CREATE INDEX "_specialists_v_version_version__status_idx" ON "_specialists_v" USING btree ("version__status");
  CREATE INDEX "_specialists_v_created_at_idx" ON "_specialists_v" USING btree ("created_at");
  CREATE INDEX "_specialists_v_updated_at_idx" ON "_specialists_v" USING btree ("updated_at");
  CREATE INDEX "_specialists_v_latest_idx" ON "_specialists_v" USING btree ("latest");
  CREATE INDEX "_specialists_v_autosave_idx" ON "_specialists_v" USING btree ("autosave");
  CREATE INDEX "_specialists_v_rels_order_idx" ON "_specialists_v_rels" USING btree ("order");
  CREATE INDEX "_specialists_v_rels_parent_idx" ON "_specialists_v_rels" USING btree ("parent_id");
  CREATE INDEX "_specialists_v_rels_path_idx" ON "_specialists_v_rels" USING btree ("path");
  CREATE INDEX "_specialists_v_rels_locations_id_idx" ON "_specialists_v_rels" USING btree ("locations_id");
  CREATE INDEX "_specialists_v_rels_accreditations_id_idx" ON "_specialists_v_rels" USING btree ("accreditations_id");
  CREATE INDEX "_specialists_v_rels_claim_types_id_idx" ON "_specialists_v_rels" USING btree ("claim_types_id");
  CREATE INDEX "_specialists_v_rels_assessment_types_id_idx" ON "_specialists_v_rels" USING btree ("assessment_types_id");
  CREATE INDEX "_specialists_v_rels_areas_of_expertise_id_idx" ON "_specialists_v_rels" USING btree ("areas_of_expertise_id");
  CREATE INDEX "team_qualifications_order_idx" ON "team_qualifications" USING btree ("_order");
  CREATE INDEX "team_qualifications_parent_id_idx" ON "team_qualifications" USING btree ("_parent_id");
  CREATE INDEX "team_sections_order_idx" ON "team_sections" USING btree ("_order");
  CREATE INDEX "team_sections_parent_id_idx" ON "team_sections" USING btree ("_parent_id");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_profile_photo_idx" ON "team" USING btree ("profile_photo_id");
  CREATE INDEX "team_meta_meta_image_idx" ON "team" USING btree ("meta_image_id");
  CREATE INDEX "team_department_idx" ON "team" USING btree ("department_id");
  CREATE UNIQUE INDEX "team_slug_idx" ON "team" USING btree ("slug");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "team__status_idx" ON "team" USING btree ("_status");
  CREATE INDEX "_team_v_version_qualifications_order_idx" ON "_team_v_version_qualifications" USING btree ("_order");
  CREATE INDEX "_team_v_version_qualifications_parent_id_idx" ON "_team_v_version_qualifications" USING btree ("_parent_id");
  CREATE INDEX "_team_v_version_sections_order_idx" ON "_team_v_version_sections" USING btree ("_order");
  CREATE INDEX "_team_v_version_sections_parent_id_idx" ON "_team_v_version_sections" USING btree ("_parent_id");
  CREATE INDEX "_team_v_parent_idx" ON "_team_v" USING btree ("parent_id");
  CREATE INDEX "_team_v_version_version_photo_idx" ON "_team_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_v_version_version_profile_photo_idx" ON "_team_v" USING btree ("version_profile_photo_id");
  CREATE INDEX "_team_v_version_meta_version_meta_image_idx" ON "_team_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_team_v_version_version_department_idx" ON "_team_v" USING btree ("version_department_id");
  CREATE INDEX "_team_v_version_version_slug_idx" ON "_team_v" USING btree ("version_slug");
  CREATE INDEX "_team_v_version_version_updated_at_idx" ON "_team_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_v_version_version_created_at_idx" ON "_team_v" USING btree ("version_created_at");
  CREATE INDEX "_team_v_version_version__status_idx" ON "_team_v" USING btree ("version__status");
  CREATE INDEX "_team_v_created_at_idx" ON "_team_v" USING btree ("created_at");
  CREATE INDEX "_team_v_updated_at_idx" ON "_team_v" USING btree ("updated_at");
  CREATE INDEX "_team_v_latest_idx" ON "_team_v" USING btree ("latest");
  CREATE INDEX "_team_v_autosave_idx" ON "_team_v" USING btree ("autosave");
  CREATE INDEX "availability_sessions_specialist_idx" ON "availability_sessions" USING btree ("specialist_id");
  CREATE INDEX "availability_sessions_updated_at_idx" ON "availability_sessions" USING btree ("updated_at");
  CREATE INDEX "availability_sessions_created_at_idx" ON "availability_sessions" USING btree ("created_at");
  CREATE INDEX "media_folder_idx" ON "media" USING btree ("folder_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_square_sizes_square_filename_idx" ON "media" USING btree ("sizes_square_filename");
  CREATE INDEX "media_sizes_small_sizes_small_filename_idx" ON "media" USING btree ("sizes_small_filename");
  CREATE INDEX "media_sizes_medium_sizes_medium_filename_idx" ON "media" USING btree ("sizes_medium_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_xlarge_sizes_xlarge_filename_idx" ON "media" USING btree ("sizes_xlarge_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "icons_updated_at_idx" ON "icons" USING btree ("updated_at");
  CREATE INDEX "icons_created_at_idx" ON "icons" USING btree ("created_at");
  CREATE UNIQUE INDEX "icons_filename_idx" ON "icons" USING btree ("filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE INDEX "redirects_rels_posts_id_idx" ON "redirects_rels" USING btree ("posts_id");
  CREATE INDEX "forms_blocks_checkbox_order_idx" ON "forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX "forms_blocks_checkbox_parent_id_idx" ON "forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_checkbox_path_idx" ON "forms_blocks_checkbox" USING btree ("_path");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "forms_blocks_email_order_idx" ON "forms_blocks_email" USING btree ("_order");
  CREATE INDEX "forms_blocks_email_parent_id_idx" ON "forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_email_path_idx" ON "forms_blocks_email" USING btree ("_path");
  CREATE INDEX "forms_blocks_message_order_idx" ON "forms_blocks_message" USING btree ("_order");
  CREATE INDEX "forms_blocks_message_parent_id_idx" ON "forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_message_path_idx" ON "forms_blocks_message" USING btree ("_path");
  CREATE INDEX "forms_blocks_number_order_idx" ON "forms_blocks_number" USING btree ("_order");
  CREATE INDEX "forms_blocks_number_parent_id_idx" ON "forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_number_path_idx" ON "forms_blocks_number" USING btree ("_path");
  CREATE INDEX "forms_blocks_select_options_order_idx" ON "forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_options_parent_id_idx" ON "forms_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_order_idx" ON "forms_blocks_select" USING btree ("_order");
  CREATE INDEX "forms_blocks_select_parent_id_idx" ON "forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_select_path_idx" ON "forms_blocks_select" USING btree ("_path");
  CREATE INDEX "forms_blocks_state_order_idx" ON "forms_blocks_state" USING btree ("_order");
  CREATE INDEX "forms_blocks_state_parent_id_idx" ON "forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_state_path_idx" ON "forms_blocks_state" USING btree ("_path");
  CREATE INDEX "forms_blocks_text_order_idx" ON "forms_blocks_text" USING btree ("_order");
  CREATE INDEX "forms_blocks_text_parent_id_idx" ON "forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_text_path_idx" ON "forms_blocks_text" USING btree ("_path");
  CREATE INDEX "forms_blocks_textarea_order_idx" ON "forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX "forms_blocks_textarea_parent_id_idx" ON "forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_textarea_path_idx" ON "forms_blocks_textarea" USING btree ("_path");
  CREATE INDEX "forms_emails_order_idx" ON "forms_emails" USING btree ("_order");
  CREATE INDEX "forms_emails_parent_id_idx" ON "forms_emails" USING btree ("_parent_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  CREATE INDEX "form_submissions_submission_data_order_idx" ON "form_submissions_submission_data" USING btree ("_order");
  CREATE INDEX "form_submissions_submission_data_parent_id_idx" ON "form_submissions_submission_data" USING btree ("_parent_id");
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "form_submissions_updated_at_idx" ON "form_submissions" USING btree ("updated_at");
  CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  CREATE INDEX "search_slug_idx" ON "search" USING btree ("slug");
  CREATE INDEX "search_uri_idx" ON "search" USING btree ("uri");
  CREATE INDEX "search_meta_meta_image_idx" ON "search" USING btree ("meta_image_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_posts_id_idx" ON "search_rels" USING btree ("posts_id");
  CREATE INDEX "search_rels_specialists_id_idx" ON "search_rels" USING btree ("specialists_id");
  CREATE INDEX "search_rels_events_id_idx" ON "search_rels" USING btree ("events_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_folders_folder_type_order_idx" ON "payload_folders_folder_type" USING btree ("order");
  CREATE INDEX "payload_folders_folder_type_parent_idx" ON "payload_folders_folder_type" USING btree ("parent_id");
  CREATE INDEX "payload_folders_name_idx" ON "payload_folders" USING btree ("name");
  CREATE INDEX "payload_folders_folder_idx" ON "payload_folders" USING btree ("folder_id");
  CREATE INDEX "payload_folders_updated_at_idx" ON "payload_folders" USING btree ("updated_at");
  CREATE INDEX "payload_folders_created_at_idx" ON "payload_folders" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");
  CREATE INDEX "payload_locked_documents_rels_offices_id_idx" ON "payload_locked_documents_rels" USING btree ("offices_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_specialties_id_idx" ON "payload_locked_documents_rels" USING btree ("specialties_id");
  CREATE INDEX "payload_locked_documents_rels_specialty_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("specialty_categories_id");
  CREATE INDEX "payload_locked_documents_rels_claim_types_id_idx" ON "payload_locked_documents_rels" USING btree ("claim_types_id");
  CREATE INDEX "payload_locked_documents_rels_assessment_types_id_idx" ON "payload_locked_documents_rels" USING btree ("assessment_types_id");
  CREATE INDEX "payload_locked_documents_rels_event_types_id_idx" ON "payload_locked_documents_rels" USING btree ("event_types_id");
  CREATE INDEX "payload_locked_documents_rels_areas_of_expertise_id_idx" ON "payload_locked_documents_rels" USING btree ("areas_of_expertise_id");
  CREATE INDEX "payload_locked_documents_rels_accreditations_id_idx" ON "payload_locked_documents_rels" USING btree ("accreditations_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");
  CREATE INDEX "payload_locked_documents_rels_streams_id_idx" ON "payload_locked_documents_rels" USING btree ("streams_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_departments_id_idx" ON "payload_locked_documents_rels" USING btree ("departments_id");
  CREATE INDEX "payload_locked_documents_rels_specialists_id_idx" ON "payload_locked_documents_rels" USING btree ("specialists_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_availability_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("availability_sessions_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_icons_id_idx" ON "payload_locked_documents_rels" USING btree ("icons_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");
  CREATE INDEX "payload_locked_documents_rels_form_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("form_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");
  CREATE INDEX "payload_locked_documents_rels_payload_folders_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_folders_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "article_settings_sidebar_cards_order_idx" ON "article_settings_sidebar_cards" USING btree ("_order");
  CREATE INDEX "article_settings_sidebar_cards_parent_id_idx" ON "article_settings_sidebar_cards" USING btree ("_parent_id");
  CREATE INDEX "article_settings_rels_order_idx" ON "article_settings_rels" USING btree ("order");
  CREATE INDEX "article_settings_rels_parent_idx" ON "article_settings_rels" USING btree ("parent_id");
  CREATE INDEX "article_settings_rels_path_idx" ON "article_settings_rels" USING btree ("path");
  CREATE INDEX "article_settings_rels_pages_id_idx" ON "article_settings_rels" USING btree ("pages_id");
  CREATE INDEX "article_settings_rels_posts_id_idx" ON "article_settings_rels" USING btree ("posts_id");
  CREATE INDEX "article_settings_rels_specialists_id_idx" ON "article_settings_rels" USING btree ("specialists_id");
  CREATE INDEX "article_settings_rels_team_id_idx" ON "article_settings_rels" USING btree ("team_id");
  CREATE INDEX "article_settings_rels_events_id_idx" ON "article_settings_rels" USING btree ("events_id");
  CREATE INDEX "specialist_profile_portal_cta_tiles_order_idx" ON "specialist_profile_portal_cta_tiles" USING btree ("_order");
  CREATE INDEX "specialist_profile_portal_cta_tiles_parent_id_idx" ON "specialist_profile_portal_cta_tiles" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_sub_items_sub_sub_items_order_idx" ON "header_nav_items_sub_items_sub_sub_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_sub_items_sub_sub_items_parent_id_idx" ON "header_nav_items_sub_items_sub_sub_items" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_sub_items_order_idx" ON "header_nav_items_sub_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_sub_items_parent_id_idx" ON "header_nav_items_sub_items" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_rels_order_idx" ON "header_rels" USING btree ("order");
  CREATE INDEX "header_rels_parent_idx" ON "header_rels" USING btree ("parent_id");
  CREATE INDEX "header_rels_path_idx" ON "header_rels" USING btree ("path");
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_posts_id_idx" ON "header_rels" USING btree ("posts_id");
  CREATE INDEX "header_rels_specialists_id_idx" ON "header_rels" USING btree ("specialists_id");
  CREATE INDEX "header_rels_team_id_idx" ON "header_rels" USING btree ("team_id");
  CREATE INDEX "header_rels_events_id_idx" ON "header_rels" USING btree ("events_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_hours_order_idx" ON "footer_hours" USING btree ("_order");
  CREATE INDEX "footer_hours_parent_id_idx" ON "footer_hours" USING btree ("_parent_id");
  CREATE INDEX "footer_social_order_idx" ON "footer_social" USING btree ("_order");
  CREATE INDEX "footer_social_parent_id_idx" ON "footer_social" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "footer_rels_order_idx" ON "footer_rels" USING btree ("order");
  CREATE INDEX "footer_rels_parent_idx" ON "footer_rels" USING btree ("parent_id");
  CREATE INDEX "footer_rels_path_idx" ON "footer_rels" USING btree ("path");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_posts_id_idx" ON "footer_rels" USING btree ("posts_id");
  CREATE INDEX "footer_rels_specialists_id_idx" ON "footer_rels" USING btree ("specialists_id");
  CREATE INDEX "footer_rels_team_id_idx" ON "footer_rels" USING btree ("team_id");
  CREATE INDEX "footer_rels_events_id_idx" ON "footer_rels" USING btree ("events_id");
  CREATE INDEX "site_settings_logo_idx" ON "site_settings" USING btree ("logo_id");
  CREATE INDEX "site_settings_logo_footer_idx" ON "site_settings" USING btree ("logo_footer_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_shield_idx" ON "site_settings" USING btree ("shield_id");
  CREATE INDEX "site_settings_social_image_idx" ON "site_settings" USING btree ("social_image_id");
  CREATE INDEX "site_settings_enquiry_form_idx" ON "site_settings" USING btree ("enquiry_form_id");
  CREATE INDEX "custom_styles_presets_order_idx" ON "custom_styles_presets" USING btree ("_order");
  CREATE INDEX "custom_styles_presets_parent_id_idx" ON "custom_styles_presets" USING btree ("_parent_id");
  CREATE INDEX "icon_library_texts_order_parent" ON "icon_library_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_hero_meta_items" CASCADE;
  DROP TABLE "pages_hero_links" CASCADE;
  DROP TABLE "pages_blocks_heading" CASCADE;
  DROP TABLE "pages_blocks_text" CASCADE;
  DROP TABLE "pages_blocks_button_links" CASCADE;
  DROP TABLE "pages_blocks_button" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "pages_blocks_spacer" CASCADE;
  DROP TABLE "pages_blocks_divider" CASCADE;
  DROP TABLE "pages_blocks_icon_block" CASCADE;
  DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_faq_items" CASCADE;
  DROP TABLE "pages_blocks_faq" CASCADE;
  DROP TABLE "pages_blocks_gateway_cards_cards_links" CASCADE;
  DROP TABLE "pages_blocks_gateway_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_gateway_cards" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_items_bullets" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_items_details" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_items" CASCADE;
  DROP TABLE "pages_blocks_feature_grid" CASCADE;
  DROP TABLE "pages_blocks_process_steps_steps_bullets" CASCADE;
  DROP TABLE "pages_blocks_process_steps_steps" CASCADE;
  DROP TABLE "pages_blocks_process_steps" CASCADE;
  DROP TABLE "pages_blocks_specialty_grid_items" CASCADE;
  DROP TABLE "pages_blocks_specialty_grid" CASCADE;
  DROP TABLE "pages_blocks_people_grid_footer_links" CASCADE;
  DROP TABLE "pages_blocks_people_grid" CASCADE;
  DROP TABLE "pages_blocks_services_grid_footer_links" CASCADE;
  DROP TABLE "pages_blocks_services_grid" CASCADE;
  DROP TABLE "pages_blocks_testimonials_grid" CASCADE;
  DROP TABLE "pages_blocks_stats_band_stats" CASCADE;
  DROP TABLE "pages_blocks_stats_band" CASCADE;
  DROP TABLE "pages_blocks_aamle_education_items" CASCADE;
  DROP TABLE "pages_blocks_aamle_education" CASCADE;
  DROP TABLE "pages_blocks_split_feature_rows_bullets" CASCADE;
  DROP TABLE "pages_blocks_split_feature_rows" CASCADE;
  DROP TABLE "pages_blocks_split_feature" CASCADE;
  DROP TABLE "pages_blocks_cta_band_links" CASCADE;
  DROP TABLE "pages_blocks_cta_band" CASCADE;
  DROP TABLE "pages_blocks_tabs_tabs" CASCADE;
  DROP TABLE "pages_blocks_tabs" CASCADE;
  DROP TABLE "pages_blocks_callout_links" CASCADE;
  DROP TABLE "pages_blocks_callout" CASCADE;
  DROP TABLE "pages_blocks_contact_details_items" CASCADE;
  DROP TABLE "pages_blocks_contact_details" CASCADE;
  DROP TABLE "pages_blocks_icon_list_items" CASCADE;
  DROP TABLE "pages_blocks_icon_list" CASCADE;
  DROP TABLE "pages_blocks_map_embed_actions" CASCADE;
  DROP TABLE "pages_blocks_map_embed" CASCADE;
  DROP TABLE "pages_blocks_leadership_spotlight_credentials" CASCADE;
  DROP TABLE "pages_blocks_leadership_spotlight" CASCADE;
  DROP TABLE "pages_blocks_portal_cta_tiles" CASCADE;
  DROP TABLE "pages_blocks_portal_cta_links" CASCADE;
  DROP TABLE "pages_blocks_portal_cta" CASCADE;
  DROP TABLE "pages_blocks_video_embed" CASCADE;
  DROP TABLE "pages_blocks_try_booking" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages_blocks_row_columns" CASCADE;
  DROP TABLE "pages_blocks_row" CASCADE;
  DROP TABLE "pages_blocks_section" CASCADE;
  DROP TABLE "pages_blocks_archive" CASCADE;
  DROP TABLE "pages_blocks_availability" CASCADE;
  DROP TABLE "pages_blocks_slide_carousel_slides_pills" CASCADE;
  DROP TABLE "pages_blocks_slide_carousel_slides" CASCADE;
  DROP TABLE "pages_blocks_slide_carousel" CASCADE;
  DROP TABLE "pages_blocks_specialist_directory" CASCADE;
  DROP TABLE "pages_blocks_specialty_directory" CASCADE;
  DROP TABLE "pages_blocks_resources_grid" CASCADE;
  DROP TABLE "appt_guide_types_tabs_items" CASCADE;
  DROP TABLE "hcards_bullets" CASCADE;
  DROP TABLE "hcards" CASCADE;
  DROP TABLE "appt_guide_types_tabs" CASCADE;
  DROP TABLE "appt_guide_types" CASCADE;
  DROP TABLE "appt_guide" CASCADE;
  DROP TABLE "pages_blocks_mission_pillars_pillars" CASCADE;
  DROP TABLE "pages_blocks_mission_pillars" CASCADE;
  DROP TABLE "pages_blocks_value_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_value_cards" CASCADE;
  DROP TABLE "pages_blocks_why_verify_items" CASCADE;
  DROP TABLE "pages_blocks_why_verify" CASCADE;
  DROP TABLE "pages_blocks_audience_pathways_pathways_steps" CASCADE;
  DROP TABLE "pages_blocks_audience_pathways_pathways" CASCADE;
  DROP TABLE "pages_blocks_audience_pathways" CASCADE;
  DROP TABLE "bkchooser_halves_links" CASCADE;
  DROP TABLE "bkchooser_halves" CASCADE;
  DROP TABLE "bkchooser" CASCADE;
  DROP TABLE "pages_blocks_cost_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_cost_grid" CASCADE;
  DROP TABLE "pages_blocks_newsletter" CASCADE;
  DROP TABLE "pages_blocks_section_nav_items" CASCADE;
  DROP TABLE "pages_blocks_section_nav" CASCADE;
  DROP TABLE "pages_blocks_featured_articles" CASCADE;
  DROP TABLE "pages_blocks_events_explorer" CASCADE;
  DROP TABLE "pages_breadcrumbs" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_version_hero_meta_items" CASCADE;
  DROP TABLE "_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_pages_v_blocks_heading" CASCADE;
  DROP TABLE "_pages_v_blocks_text" CASCADE;
  DROP TABLE "_pages_v_blocks_button_links" CASCADE;
  DROP TABLE "_pages_v_blocks_button" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_spacer" CASCADE;
  DROP TABLE "_pages_v_blocks_divider" CASCADE;
  DROP TABLE "_pages_v_blocks_icon_block" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq" CASCADE;
  DROP TABLE "_pages_v_blocks_gateway_cards_cards_links" CASCADE;
  DROP TABLE "_pages_v_blocks_gateway_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_gateway_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid_items_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid_items_details" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_steps_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_specialty_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_specialty_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_people_grid_footer_links" CASCADE;
  DROP TABLE "_pages_v_blocks_people_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_services_grid_footer_links" CASCADE;
  DROP TABLE "_pages_v_blocks_services_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_band_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_stats_band" CASCADE;
  DROP TABLE "_pages_v_blocks_aamle_education_items" CASCADE;
  DROP TABLE "_pages_v_blocks_aamle_education" CASCADE;
  DROP TABLE "_pages_v_blocks_split_feature_rows_bullets" CASCADE;
  DROP TABLE "_pages_v_blocks_split_feature_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_split_feature" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_band" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_callout_links" CASCADE;
  DROP TABLE "_pages_v_blocks_callout" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_details_items" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_details" CASCADE;
  DROP TABLE "_pages_v_blocks_icon_list_items" CASCADE;
  DROP TABLE "_pages_v_blocks_icon_list" CASCADE;
  DROP TABLE "_pages_v_blocks_map_embed_actions" CASCADE;
  DROP TABLE "_pages_v_blocks_map_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_leadership_spotlight_credentials" CASCADE;
  DROP TABLE "_pages_v_blocks_leadership_spotlight" CASCADE;
  DROP TABLE "_pages_v_blocks_portal_cta_tiles" CASCADE;
  DROP TABLE "_pages_v_blocks_portal_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_portal_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_video_embed" CASCADE;
  DROP TABLE "_pages_v_blocks_try_booking" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v_blocks_row_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_row" CASCADE;
  DROP TABLE "_pages_v_blocks_section" CASCADE;
  DROP TABLE "_pages_v_blocks_archive" CASCADE;
  DROP TABLE "_pages_v_blocks_availability" CASCADE;
  DROP TABLE "_pages_v_blocks_slide_carousel_slides_pills" CASCADE;
  DROP TABLE "_pages_v_blocks_slide_carousel_slides" CASCADE;
  DROP TABLE "_pages_v_blocks_slide_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_specialist_directory" CASCADE;
  DROP TABLE "_pages_v_blocks_specialty_directory" CASCADE;
  DROP TABLE "_pages_v_blocks_resources_grid" CASCADE;
  DROP TABLE "_appt_guide_v_types_tabs_items" CASCADE;
  DROP TABLE "_hcards_v_bullets" CASCADE;
  DROP TABLE "_hcards_v" CASCADE;
  DROP TABLE "_appt_guide_v_types_tabs" CASCADE;
  DROP TABLE "_appt_guide_v_types" CASCADE;
  DROP TABLE "_appt_guide_v" CASCADE;
  DROP TABLE "_pages_v_blocks_mission_pillars_pillars" CASCADE;
  DROP TABLE "_pages_v_blocks_mission_pillars" CASCADE;
  DROP TABLE "_pages_v_blocks_value_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_value_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_why_verify_items" CASCADE;
  DROP TABLE "_pages_v_blocks_why_verify" CASCADE;
  DROP TABLE "_pages_v_blocks_audience_pathways_pathways_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_audience_pathways_pathways" CASCADE;
  DROP TABLE "_pages_v_blocks_audience_pathways" CASCADE;
  DROP TABLE "_bkchooser_v_halves_links" CASCADE;
  DROP TABLE "_bkchooser_v_halves" CASCADE;
  DROP TABLE "_bkchooser_v" CASCADE;
  DROP TABLE "_pages_v_blocks_cost_grid_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_cost_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter" CASCADE;
  DROP TABLE "_pages_v_blocks_section_nav_items" CASCADE;
  DROP TABLE "_pages_v_blocks_section_nav" CASCADE;
  DROP TABLE "_pages_v_blocks_featured_articles" CASCADE;
  DROP TABLE "_pages_v_blocks_events_explorer" CASCADE;
  DROP TABLE "_pages_v_version_breadcrumbs" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  DROP TABLE "posts_attachments" CASCADE;
  DROP TABLE "posts_populated_authors" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_attachments" CASCADE;
  DROP TABLE "_posts_v_version_populated_authors" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  DROP TABLE "events_gallery" CASCADE;
  DROP TABLE "events_attachments" CASCADE;
  DROP TABLE "events_guest_presenters" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v_version_gallery" CASCADE;
  DROP TABLE "_events_v_version_attachments" CASCADE;
  DROP TABLE "_events_v_version_guest_presenters" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "resources" CASCADE;
  DROP TABLE "offices_hours" CASCADE;
  DROP TABLE "offices_transport" CASCADE;
  DROP TABLE "offices_parking" CASCADE;
  DROP TABLE "offices" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "specialties_key_areas" CASCADE;
  DROP TABLE "specialties" CASCADE;
  DROP TABLE "specialty_categories" CASCADE;
  DROP TABLE "claim_types" CASCADE;
  DROP TABLE "assessment_types" CASCADE;
  DROP TABLE "event_types" CASCADE;
  DROP TABLE "areas_of_expertise" CASCADE;
  DROP TABLE "accreditations" CASCADE;
  DROP TABLE "locations" CASCADE;
  DROP TABLE "streams" CASCADE;
  DROP TABLE "categories_breadcrumbs" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "departments" CASCADE;
  DROP TABLE "specialists_qualifications" CASCADE;
  DROP TABLE "specialists_languages" CASCADE;
  DROP TABLE "specialists" CASCADE;
  DROP TABLE "specialists_rels" CASCADE;
  DROP TABLE "_specialists_v_version_qualifications" CASCADE;
  DROP TABLE "_specialists_v_version_languages" CASCADE;
  DROP TABLE "_specialists_v" CASCADE;
  DROP TABLE "_specialists_v_rels" CASCADE;
  DROP TABLE "team_qualifications" CASCADE;
  DROP TABLE "team_sections" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "_team_v_version_qualifications" CASCADE;
  DROP TABLE "_team_v_version_sections" CASCADE;
  DROP TABLE "_team_v" CASCADE;
  DROP TABLE "availability_sessions" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "icons" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "forms_blocks_checkbox" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "forms_blocks_email" CASCADE;
  DROP TABLE "forms_blocks_message" CASCADE;
  DROP TABLE "forms_blocks_number" CASCADE;
  DROP TABLE "forms_blocks_select_options" CASCADE;
  DROP TABLE "forms_blocks_select" CASCADE;
  DROP TABLE "forms_blocks_state" CASCADE;
  DROP TABLE "forms_blocks_text" CASCADE;
  DROP TABLE "forms_blocks_textarea" CASCADE;
  DROP TABLE "forms_emails" CASCADE;
  DROP TABLE "forms" CASCADE;
  DROP TABLE "form_submissions_submission_data" CASCADE;
  DROP TABLE "form_submissions" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_folders_folder_type" CASCADE;
  DROP TABLE "payload_folders" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "article_settings_sidebar_cards" CASCADE;
  DROP TABLE "article_settings" CASCADE;
  DROP TABLE "article_settings_rels" CASCADE;
  DROP TABLE "events_settings" CASCADE;
  DROP TABLE "team_settings" CASCADE;
  DROP TABLE "specialist_profile_portal_cta_tiles" CASCADE;
  DROP TABLE "specialist_profile" CASCADE;
  DROP TABLE "specialist_availability" CASCADE;
  DROP TABLE "header_nav_items_sub_items_sub_sub_items" CASCADE;
  DROP TABLE "header_nav_items_sub_items" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_rels" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_hours" CASCADE;
  DROP TABLE "footer_social" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_rels" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "custom_styles_presets" CASCADE;
  DROP TABLE "custom_styles" CASCADE;
  DROP TABLE "design_system" CASCADE;
  DROP TABLE "icon_library" CASCADE;
  DROP TABLE "icon_library_texts" CASCADE;
  DROP TYPE "public"."enum_pages_hero_links_link_type";
  DROP TYPE "public"."enum_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_heading_level";
  DROP TYPE "public"."enum_pages_blocks_heading_size";
  DROP TYPE "public"."enum_pages_blocks_heading_align";
  DROP TYPE "public"."enum_pages_blocks_text_size";
  DROP TYPE "public"."enum_pages_blocks_text_align";
  DROP TYPE "public"."enum_pages_blocks_button_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_button_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_button_size";
  DROP TYPE "public"."enum_pages_blocks_button_align";
  DROP TYPE "public"."enum_pages_blocks_image_width";
  DROP TYPE "public"."enum_pages_blocks_image_rounded";
  DROP TYPE "public"."enum_pages_blocks_image_shadow";
  DROP TYPE "public"."enum_pages_blocks_image_align";
  DROP TYPE "public"."enum_pages_blocks_spacer_size";
  DROP TYPE "public"."enum_pages_blocks_divider_style";
  DROP TYPE "public"."enum_pages_blocks_divider_width";
  DROP TYPE "public"."enum_pages_blocks_divider_align";
  DROP TYPE "public"."enum_pages_blocks_icon_block_size";
  DROP TYPE "public"."enum_pages_blocks_icon_block_color";
  DROP TYPE "public"."enum_pages_blocks_icon_block_align";
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_faq_text_colour";
  DROP TYPE "public"."enum_pages_blocks_faq_columns";
  DROP TYPE "public"."enum_pages_blocks_faq_item_style";
  DROP TYPE "public"."enum_pages_blocks_faq_toggle_style";
  DROP TYPE "public"."enum_pages_blocks_faq_icon_style";
  DROP TYPE "public"."enum_pages_blocks_faq_density";
  DROP TYPE "public"."enum_pages_blocks_faq_container_width";
  DROP TYPE "public"."enum_pages_blocks_faq_rule_style";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_cards_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_cards_accent";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_cards_theme";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_cards_link_type";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_cards_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_text_colour";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_background";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_columns";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_container_width";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_motion";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_hover_effect";
  DROP TYPE "public"."enum_pages_blocks_gateway_cards_shadow";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_text_colour";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_background";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_card_style";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_heading_weight";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_container_width";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_motion";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_hover_effect";
  DROP TYPE "public"."enum_pages_blocks_feature_grid_shadow";
  DROP TYPE "public"."enum_pages_blocks_process_steps_steps_badge_style";
  DROP TYPE "public"."enum_pages_blocks_process_steps_text_colour";
  DROP TYPE "public"."enum_pages_blocks_process_steps_background";
  DROP TYPE "public"."enum_pages_blocks_process_steps_variant";
  DROP TYPE "public"."enum_pages_blocks_process_steps_number_style";
  DROP TYPE "public"."enum_pages_blocks_process_steps_columns";
  DROP TYPE "public"."enum_pages_blocks_process_steps_container_width";
  DROP TYPE "public"."enum_pages_blocks_process_steps_motion";
  DROP TYPE "public"."enum_pages_blocks_process_steps_hover_effect";
  DROP TYPE "public"."enum_pages_blocks_process_steps_shadow";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_text_colour";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_background";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_source";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_taxonomy";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_variant";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_container_width";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_motion";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_hover_effect";
  DROP TYPE "public"."enum_pages_blocks_specialty_grid_shadow";
  DROP TYPE "public"."enum_pages_blocks_people_grid_footer_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_people_grid_footer_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_people_grid_text_colour";
  DROP TYPE "public"."enum_pages_blocks_people_grid_background";
  DROP TYPE "public"."enum_pages_blocks_people_grid_header_background";
  DROP TYPE "public"."enum_pages_blocks_people_grid_source";
  DROP TYPE "public"."enum_pages_blocks_people_grid_layout";
  DROP TYPE "public"."enum_pages_blocks_people_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_people_grid_carousel_options_direction";
  DROP TYPE "public"."enum_pages_blocks_people_grid_container_width";
  DROP TYPE "public"."enum_pages_blocks_people_grid_motion";
  DROP TYPE "public"."enum_pages_blocks_people_grid_hover_effect";
  DROP TYPE "public"."enum_pages_blocks_people_grid_shadow";
  DROP TYPE "public"."enum_pages_blocks_services_grid_footer_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_services_grid_text_colour";
  DROP TYPE "public"."enum_pages_blocks_services_grid_background";
  DROP TYPE "public"."enum_pages_blocks_services_grid_source";
  DROP TYPE "public"."enum_pages_blocks_services_grid_category";
  DROP TYPE "public"."enum_pages_blocks_services_grid_service_group";
  DROP TYPE "public"."enum_pages_blocks_services_grid_layout";
  DROP TYPE "public"."enum_pages_blocks_services_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_services_grid_card_align";
  DROP TYPE "public"."enum_pages_blocks_services_grid_container_width";
  DROP TYPE "public"."enum_pages_blocks_services_grid_motion";
  DROP TYPE "public"."enum_pages_blocks_services_grid_hover_effect";
  DROP TYPE "public"."enum_pages_blocks_services_grid_shadow";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_text_colour";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_background";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_source";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_layout";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_container_width";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_motion";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_hover_effect";
  DROP TYPE "public"."enum_pages_blocks_testimonials_grid_shadow";
  DROP TYPE "public"."enum_pages_blocks_stats_band_text_colour";
  DROP TYPE "public"."enum_pages_blocks_stats_band_background";
  DROP TYPE "public"."enum_pages_blocks_stats_band_container_width";
  DROP TYPE "public"."enum_pages_blocks_stats_band_motion";
  DROP TYPE "public"."enum_pages_blocks_aamle_education_background";
  DROP TYPE "public"."enum_pages_blocks_aamle_education_link_type";
  DROP TYPE "public"."enum_pages_blocks_aamle_education_container_width";
  DROP TYPE "public"."enum_pages_blocks_aamle_education_motion";
  DROP TYPE "public"."enum_pages_blocks_split_feature_rows_image_side";
  DROP TYPE "public"."enum_pages_blocks_split_feature_rows_link_type";
  DROP TYPE "public"."enum_pages_blocks_split_feature_text_colour";
  DROP TYPE "public"."enum_pages_blocks_split_feature_background";
  DROP TYPE "public"."enum_pages_blocks_split_feature_row_style";
  DROP TYPE "public"."enum_pages_blocks_split_feature_density";
  DROP TYPE "public"."enum_pages_blocks_split_feature_bullet_style";
  DROP TYPE "public"."enum_pages_blocks_split_feature_heading_weight";
  DROP TYPE "public"."enum_pages_blocks_split_feature_container_width";
  DROP TYPE "public"."enum_pages_blocks_split_feature_motion";
  DROP TYPE "public"."enum_pages_blocks_cta_band_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_band_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_band_container_width";
  DROP TYPE "public"."enum_pages_blocks_cta_band_motion";
  DROP TYPE "public"."enum_pages_blocks_tabs_text_colour";
  DROP TYPE "public"."enum_pages_blocks_tabs_background";
  DROP TYPE "public"."enum_pages_blocks_tabs_tab_style";
  DROP TYPE "public"."enum_pages_blocks_tabs_container_width";
  DROP TYPE "public"."enum_pages_blocks_tabs_motion";
  DROP TYPE "public"."enum_pages_blocks_callout_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_callout_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_callout_style";
  DROP TYPE "public"."enum_pages_blocks_contact_details_text_colour";
  DROP TYPE "public"."enum_pages_blocks_contact_details_container_width";
  DROP TYPE "public"."enum_pages_blocks_contact_details_motion";
  DROP TYPE "public"."enum_pages_blocks_icon_list_text_colour";
  DROP TYPE "public"."enum_pages_blocks_icon_list_heading_align";
  DROP TYPE "public"."enum_pages_blocks_icon_list_columns";
  DROP TYPE "public"."enum_pages_blocks_icon_list_container_width";
  DROP TYPE "public"."enum_pages_blocks_icon_list_motion";
  DROP TYPE "public"."enum_pages_blocks_map_embed_actions_link_type";
  DROP TYPE "public"."enum_pages_blocks_map_embed_actions_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_map_embed_text_colour";
  DROP TYPE "public"."enum_pages_blocks_map_embed_kind";
  DROP TYPE "public"."enum_pages_blocks_map_embed_aspect";
  DROP TYPE "public"."enum_pages_blocks_map_embed_container_width";
  DROP TYPE "public"."enum_pages_blocks_map_embed_motion";
  DROP TYPE "public"."enum_pages_blocks_leadership_spotlight_text_colour";
  DROP TYPE "public"."enum_pages_blocks_leadership_spotlight_background";
  DROP TYPE "public"."enum_pages_blocks_leadership_spotlight_link_type";
  DROP TYPE "public"."enum_pages_blocks_leadership_spotlight_container_width";
  DROP TYPE "public"."enum_pages_blocks_leadership_spotlight_motion";
  DROP TYPE "public"."enum_pages_blocks_portal_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_video_embed_text_colour";
  DROP TYPE "public"."enum_pages_blocks_video_embed_provider";
  DROP TYPE "public"."enum_pages_blocks_video_embed_aspect";
  DROP TYPE "public"."enum_pages_blocks_video_embed_background";
  DROP TYPE "public"."enum_pages_blocks_video_embed_container_width";
  DROP TYPE "public"."enum_pages_blocks_video_embed_motion";
  DROP TYPE "public"."enum_pages_blocks_try_booking_text_colour";
  DROP TYPE "public"."enum_pages_blocks_try_booking_widget_type";
  DROP TYPE "public"."enum_pages_blocks_try_booking_background";
  DROP TYPE "public"."enum_pages_blocks_try_booking_container_width";
  DROP TYPE "public"."enum_pages_blocks_try_booking_motion";
  DROP TYPE "public"."enum_pages_blocks_form_block_card_style";
  DROP TYPE "public"."enum_pages_blocks_row_columns_span";
  DROP TYPE "public"."enum_pages_blocks_row_columns_align";
  DROP TYPE "public"."enum_pages_blocks_row_gap";
  DROP TYPE "public"."enum_pages_blocks_row_align_y";
  DROP TYPE "public"."enum_pages_blocks_row_column_ratio";
  DROP TYPE "public"."enum_pages_blocks_section_background";
  DROP TYPE "public"."enum_pages_blocks_section_container_width";
  DROP TYPE "public"."enum_pages_blocks_section_padding_top";
  DROP TYPE "public"."enum_pages_blocks_section_padding_bottom";
  DROP TYPE "public"."enum_pages_blocks_section_motion";
  DROP TYPE "public"."enum_pages_blocks_section_align";
  DROP TYPE "public"."enum_pages_blocks_archive_background";
  DROP TYPE "public"."enum_pages_blocks_archive_populate_by";
  DROP TYPE "public"."enum_pages_blocks_archive_relation_to";
  DROP TYPE "public"."enum_pages_blocks_archive_view";
  DROP TYPE "public"."enum_pages_blocks_archive_post_style";
  DROP TYPE "public"."enum_pages_blocks_archive_event_style";
  DROP TYPE "public"."enum_pages_blocks_archive_columns";
  DROP TYPE "public"."enum_pages_blocks_archive_view_all_link_link_type";
  DROP TYPE "public"."enum_pages_blocks_slide_carousel_slides_accent";
  DROP TYPE "public"."enum_pages_blocks_specialist_directory_text_colour";
  DROP TYPE "public"."enum_pages_blocks_specialist_directory_background";
  DROP TYPE "public"."enum_pages_blocks_specialist_directory_sort_by";
  DROP TYPE "public"."enum_pages_blocks_specialty_directory_text_colour";
  DROP TYPE "public"."enum_pages_blocks_specialty_directory_background";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_text_colour";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_background";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_source";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_variant";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_audience";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_resource_type";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_columns";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_container_width";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_motion";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_hover_effect";
  DROP TYPE "public"."enum_pages_blocks_resources_grid_shadow";
  DROP TYPE "public"."enum_appt_guide_types_tabs_callout_style";
  DROP TYPE "public"."enum_appt_guide_text_colour";
  DROP TYPE "public"."enum_pages_blocks_mission_pillars_background";
  DROP TYPE "public"."enum_pages_blocks_mission_pillars_text_colour";
  DROP TYPE "public"."enum_pages_blocks_mission_pillars_container_width";
  DROP TYPE "public"."enum_pages_blocks_mission_pillars_motion";
  DROP TYPE "public"."enum_pages_blocks_value_cards_text_colour";
  DROP TYPE "public"."enum_pages_blocks_value_cards_background";
  DROP TYPE "public"."enum_pages_blocks_value_cards_container_width";
  DROP TYPE "public"."enum_pages_blocks_value_cards_motion";
  DROP TYPE "public"."enum_pages_blocks_why_verify_text_colour";
  DROP TYPE "public"."enum_pages_blocks_why_verify_container_width";
  DROP TYPE "public"."enum_pages_blocks_why_verify_motion";
  DROP TYPE "public"."enum_pages_blocks_audience_pathways_pathways_variant";
  DROP TYPE "public"."enum_pages_blocks_audience_pathways_pathways_link_type";
  DROP TYPE "public"."enum_pages_blocks_audience_pathways_text_colour";
  DROP TYPE "public"."enum_pages_blocks_audience_pathways_background";
  DROP TYPE "public"."enum_pages_blocks_audience_pathways_container_width";
  DROP TYPE "public"."enum_pages_blocks_audience_pathways_motion";
  DROP TYPE "public"."enum_bkchooser_halves_links_link_type";
  DROP TYPE "public"."enum_bkchooser_halves_accent";
  DROP TYPE "public"."enum_bkchooser_density";
  DROP TYPE "public"."enum_pages_blocks_cost_grid_text_colour";
  DROP TYPE "public"."enum_pages_blocks_featured_articles_source";
  DROP TYPE "public"."enum_pages_blocks_featured_articles_background";
  DROP TYPE "public"."enum_pages_blocks_events_explorer_text_colour";
  DROP TYPE "public"."enum_pages_blocks_events_explorer_mode";
  DROP TYPE "public"."enum_pages_blocks_events_explorer_card_style";
  DROP TYPE "public"."enum_pages_blocks_events_explorer_separator_divider";
  DROP TYPE "public"."enum_pages_blocks_events_explorer_separator_divider_width";
  DROP TYPE "public"."enum_pages_blocks_events_explorer_separator_past_background";
  DROP TYPE "public"."enum_pages_blocks_events_explorer_background";
  DROP TYPE "public"."enum_pages_hero_type";
  DROP TYPE "public"."enum_pages_hero_theme";
  DROP TYPE "public"."enum_pages_hero_align";
  DROP TYPE "public"."enum_pages_hero_hero_background";
  DROP TYPE "public"."enum_pages_hero_container_width";
  DROP TYPE "public"."enum_pages_hero_hero_padding_top";
  DROP TYPE "public"."enum_pages_hero_hero_padding_bottom";
  DROP TYPE "public"."enum_pages_hero_definition_definition_style";
  DROP TYPE "public"."enum_pages_hero_definition_interaction";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_heading_level";
  DROP TYPE "public"."enum__pages_v_blocks_heading_size";
  DROP TYPE "public"."enum__pages_v_blocks_heading_align";
  DROP TYPE "public"."enum__pages_v_blocks_text_size";
  DROP TYPE "public"."enum__pages_v_blocks_text_align";
  DROP TYPE "public"."enum__pages_v_blocks_button_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_button_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_button_size";
  DROP TYPE "public"."enum__pages_v_blocks_button_align";
  DROP TYPE "public"."enum__pages_v_blocks_image_width";
  DROP TYPE "public"."enum__pages_v_blocks_image_rounded";
  DROP TYPE "public"."enum__pages_v_blocks_image_shadow";
  DROP TYPE "public"."enum__pages_v_blocks_image_align";
  DROP TYPE "public"."enum__pages_v_blocks_spacer_size";
  DROP TYPE "public"."enum__pages_v_blocks_divider_style";
  DROP TYPE "public"."enum__pages_v_blocks_divider_width";
  DROP TYPE "public"."enum__pages_v_blocks_divider_align";
  DROP TYPE "public"."enum__pages_v_blocks_icon_block_size";
  DROP TYPE "public"."enum__pages_v_blocks_icon_block_color";
  DROP TYPE "public"."enum__pages_v_blocks_icon_block_align";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_faq_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_faq_columns";
  DROP TYPE "public"."enum__pages_v_blocks_faq_item_style";
  DROP TYPE "public"."enum__pages_v_blocks_faq_toggle_style";
  DROP TYPE "public"."enum__pages_v_blocks_faq_icon_style";
  DROP TYPE "public"."enum__pages_v_blocks_faq_density";
  DROP TYPE "public"."enum__pages_v_blocks_faq_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_faq_rule_style";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_accent";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_theme";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_cards_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_background";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_columns";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_motion";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_hover_effect";
  DROP TYPE "public"."enum__pages_v_blocks_gateway_cards_shadow";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_background";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_card_style";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_heading_weight";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_motion";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_hover_effect";
  DROP TYPE "public"."enum__pages_v_blocks_feature_grid_shadow";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_steps_badge_style";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_background";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_variant";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_number_style";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_columns";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_motion";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_hover_effect";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_shadow";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_background";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_taxonomy";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_variant";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_motion";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_hover_effect";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_grid_shadow";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_footer_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_footer_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_background";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_header_background";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_layout";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_carousel_options_direction";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_motion";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_hover_effect";
  DROP TYPE "public"."enum__pages_v_blocks_people_grid_shadow";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_footer_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_background";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_category";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_service_group";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_layout";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_card_align";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_motion";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_hover_effect";
  DROP TYPE "public"."enum__pages_v_blocks_services_grid_shadow";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_background";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_layout";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_motion";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_hover_effect";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_grid_shadow";
  DROP TYPE "public"."enum__pages_v_blocks_stats_band_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_stats_band_background";
  DROP TYPE "public"."enum__pages_v_blocks_stats_band_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_stats_band_motion";
  DROP TYPE "public"."enum__pages_v_blocks_aamle_education_background";
  DROP TYPE "public"."enum__pages_v_blocks_aamle_education_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_aamle_education_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_aamle_education_motion";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_rows_image_side";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_rows_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_background";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_row_style";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_density";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_bullet_style";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_heading_weight";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_split_feature_motion";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_cta_band_motion";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_background";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_tab_style";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_motion";
  DROP TYPE "public"."enum__pages_v_blocks_callout_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_callout_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_callout_style";
  DROP TYPE "public"."enum__pages_v_blocks_contact_details_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_contact_details_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_contact_details_motion";
  DROP TYPE "public"."enum__pages_v_blocks_icon_list_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_icon_list_heading_align";
  DROP TYPE "public"."enum__pages_v_blocks_icon_list_columns";
  DROP TYPE "public"."enum__pages_v_blocks_icon_list_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_icon_list_motion";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_actions_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_actions_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_kind";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_aspect";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_motion";
  DROP TYPE "public"."enum__pages_v_blocks_leadership_spotlight_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_leadership_spotlight_background";
  DROP TYPE "public"."enum__pages_v_blocks_leadership_spotlight_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_leadership_spotlight_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_leadership_spotlight_motion";
  DROP TYPE "public"."enum__pages_v_blocks_portal_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_video_embed_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_video_embed_provider";
  DROP TYPE "public"."enum__pages_v_blocks_video_embed_aspect";
  DROP TYPE "public"."enum__pages_v_blocks_video_embed_background";
  DROP TYPE "public"."enum__pages_v_blocks_video_embed_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_video_embed_motion";
  DROP TYPE "public"."enum__pages_v_blocks_try_booking_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_try_booking_widget_type";
  DROP TYPE "public"."enum__pages_v_blocks_try_booking_background";
  DROP TYPE "public"."enum__pages_v_blocks_try_booking_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_try_booking_motion";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_card_style";
  DROP TYPE "public"."enum__pages_v_blocks_row_columns_span";
  DROP TYPE "public"."enum__pages_v_blocks_row_columns_align";
  DROP TYPE "public"."enum__pages_v_blocks_row_gap";
  DROP TYPE "public"."enum__pages_v_blocks_row_align_y";
  DROP TYPE "public"."enum__pages_v_blocks_row_column_ratio";
  DROP TYPE "public"."enum__pages_v_blocks_section_background";
  DROP TYPE "public"."enum__pages_v_blocks_section_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_section_padding_top";
  DROP TYPE "public"."enum__pages_v_blocks_section_padding_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_section_motion";
  DROP TYPE "public"."enum__pages_v_blocks_section_align";
  DROP TYPE "public"."enum__pages_v_blocks_archive_background";
  DROP TYPE "public"."enum__pages_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__pages_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__pages_v_blocks_archive_view";
  DROP TYPE "public"."enum__pages_v_blocks_archive_post_style";
  DROP TYPE "public"."enum__pages_v_blocks_archive_event_style";
  DROP TYPE "public"."enum__pages_v_blocks_archive_columns";
  DROP TYPE "public"."enum__pages_v_blocks_archive_view_all_link_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_slide_carousel_slides_accent";
  DROP TYPE "public"."enum__pages_v_blocks_specialist_directory_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_specialist_directory_background";
  DROP TYPE "public"."enum__pages_v_blocks_specialist_directory_sort_by";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_directory_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_specialty_directory_background";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_background";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_variant";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_audience";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_resource_type";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_columns";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_motion";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_hover_effect";
  DROP TYPE "public"."enum__pages_v_blocks_resources_grid_shadow";
  DROP TYPE "public"."enum__appt_guide_v_types_tabs_callout_style";
  DROP TYPE "public"."enum__appt_guide_v_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_mission_pillars_background";
  DROP TYPE "public"."enum__pages_v_blocks_mission_pillars_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_mission_pillars_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_mission_pillars_motion";
  DROP TYPE "public"."enum__pages_v_blocks_value_cards_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_value_cards_background";
  DROP TYPE "public"."enum__pages_v_blocks_value_cards_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_value_cards_motion";
  DROP TYPE "public"."enum__pages_v_blocks_why_verify_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_why_verify_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_why_verify_motion";
  DROP TYPE "public"."enum__pages_v_blocks_audience_pathways_pathways_variant";
  DROP TYPE "public"."enum__pages_v_blocks_audience_pathways_pathways_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_audience_pathways_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_audience_pathways_background";
  DROP TYPE "public"."enum__pages_v_blocks_audience_pathways_container_width";
  DROP TYPE "public"."enum__pages_v_blocks_audience_pathways_motion";
  DROP TYPE "public"."enum__bkchooser_v_halves_links_link_type";
  DROP TYPE "public"."enum__bkchooser_v_halves_accent";
  DROP TYPE "public"."enum__bkchooser_v_density";
  DROP TYPE "public"."enum__pages_v_blocks_cost_grid_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_featured_articles_source";
  DROP TYPE "public"."enum__pages_v_blocks_featured_articles_background";
  DROP TYPE "public"."enum__pages_v_blocks_events_explorer_text_colour";
  DROP TYPE "public"."enum__pages_v_blocks_events_explorer_mode";
  DROP TYPE "public"."enum__pages_v_blocks_events_explorer_card_style";
  DROP TYPE "public"."enum__pages_v_blocks_events_explorer_separator_divider";
  DROP TYPE "public"."enum__pages_v_blocks_events_explorer_separator_divider_width";
  DROP TYPE "public"."enum__pages_v_blocks_events_explorer_separator_past_background";
  DROP TYPE "public"."enum__pages_v_blocks_events_explorer_background";
  DROP TYPE "public"."enum__pages_v_version_hero_type";
  DROP TYPE "public"."enum__pages_v_version_hero_theme";
  DROP TYPE "public"."enum__pages_v_version_hero_align";
  DROP TYPE "public"."enum__pages_v_version_hero_hero_background";
  DROP TYPE "public"."enum__pages_v_version_hero_container_width";
  DROP TYPE "public"."enum__pages_v_version_hero_hero_padding_top";
  DROP TYPE "public"."enum__pages_v_version_hero_hero_padding_bottom";
  DROP TYPE "public"."enum__pages_v_version_hero_definition_definition_style";
  DROP TYPE "public"."enum__pages_v_version_hero_definition_interaction";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum_events_host";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_host";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_services_category";
  DROP TYPE "public"."enum_services_service_group";
  DROP TYPE "public"."enum_resources_resource_type";
  DROP TYPE "public"."enum_resources_audience";
  DROP TYPE "public"."enum_specialists_profile_photo_shape";
  DROP TYPE "public"."enum_specialists_status";
  DROP TYPE "public"."enum__specialists_v_version_profile_photo_shape";
  DROP TYPE "public"."enum__specialists_v_version_status";
  DROP TYPE "public"."enum_team_profile_photo_shape";
  DROP TYPE "public"."enum_team_status";
  DROP TYPE "public"."enum__team_v_version_profile_photo_shape";
  DROP TYPE "public"."enum__team_v_version_status";
  DROP TYPE "public"."enum_availability_sessions_mode";
  DROP TYPE "public"."enum_availability_sessions_status";
  DROP TYPE "public"."enum_icons_colour";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_forms_confirmation_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_payload_folders_folder_type";
  DROP TYPE "public"."enum_article_settings_sidebar_cards_link_type";
  DROP TYPE "public"."enum_header_nav_items_sub_items_sub_sub_items_link_type";
  DROP TYPE "public"."enum_header_nav_items_sub_items_link_type";
  DROP TYPE "public"."enum_header_nav_items_link_type";
  DROP TYPE "public"."enum_header_cta_link_type";
  DROP TYPE "public"."enum_footer_columns_links_link_type";
  DROP TYPE "public"."enum_footer_social_platform";
  DROP TYPE "public"."enum_footer_legal_links_link_type";
  DROP TYPE "public"."enum_design_system_typography_text_scale";`)
}
