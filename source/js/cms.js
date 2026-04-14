/* global Promise, fetch, URLSearchParams, CustomEvent */
(function () {
  'use strict';

  var DATA_FILES = {
    site: 'data/site.json',
    home: 'data/home.json',
    about: 'data/about.json',
    contact: 'data/contact.json',
    blogPage: 'data/blog-page.json',
    coursesPage: 'data/courses-page.json',
    resourcesPage: 'data/resources-page.json',
    feedbackPage: 'data/feedback-page.json',
    blogPosts: 'data/blog-posts.json',
    courses: 'data/courses-items.json',
    feedback: 'data/feedback-items.json',
    resources: 'data/resource-items.json'
  };

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setText(selector, value) {
    qsa(selector).forEach(function (node) {
      node.textContent = value || '';
    });
  }

  function setHtml(selector, value) {
    qsa(selector).forEach(function (node) {
      node.innerHTML = value || '';
    });
  }

  function setLink(selector, href) {
    qsa(selector).forEach(function (node) {
      node.setAttribute('href', href || '#');
    });
  }

  function setAttribute(selector, attribute, value) {
    qsa(selector).forEach(function (node) {
      if (value === undefined || value === null || value === '') {
        node.removeAttribute(attribute);
        return;
      }
      node.setAttribute(attribute, value);
    });
  }

  function setVisible(selector, isVisible) {
    qsa(selector).forEach(function (node) {
      node.style.display = isVisible ? '' : 'none';
    });
  }

  function setImage(selector, src, alt) {
    qsa(selector).forEach(function (node) {
      node.setAttribute('src', src || '');
      if (alt) {
        node.setAttribute('alt', alt);
      }
    });
  }

  function setDataBackground(selector, src) {
    qsa(selector).forEach(function (node) {
      node.setAttribute('data-background', src || '');
      node.style.backgroundImage = src ? 'url(' + src + ')' : '';
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripHtml(value) {
    return String(value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function hasHtml(value) {
    return /<\/?[a-z][\s\S]*>/i.test(String(value || ''));
  }

  function richTextMarkup(value, defaultTag) {
    var content = String(value || '').trim();
    var tag = defaultTag || 'p';

    if (!content) {
      return '';
    }

    if (hasHtml(content)) {
      return content;
    }

    return content
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map(function (block) {
        return '<' + tag + '>' + escapeHtml(block).replace(/\n/g, '<br>') + '</' + tag + '>';
      })
      .join('');
  }

  function richTextListMarkup(items, defaultTag) {
    return (items || []).map(function (item) {
      return richTextMarkup(item, defaultTag);
    }).join('');
  }

  function resolveRichText(value, fallbackItems, defaultTag) {
    if (value) {
      return richTextMarkup(value, defaultTag);
    }

    return richTextListMarkup(fallbackItems, defaultTag);
  }

  function setRichText(selector, value, defaultTag) {
    setHtml(selector, richTextMarkup(value, defaultTag));
  }

  function listMarkup(items, className) {
    if (!items || !items.length) {
      return '';
    }
    return '<ul class="' + (className || 'list-styled') + '">' + items.map(function (item) {
      return '<li>' + escapeHtml(item) + '</li>';
    }).join('') + '</ul>';
  }

  function getPageName() {
    var path = window.location.pathname.replace(/\/+$/, '').split('/').pop() || 'index.html';
    var lowerPath = path.toLowerCase();

    if (!lowerPath) {
      return 'index.html';
    }

    if (lowerPath.indexOf('.') === -1) {
      return lowerPath === 'index' ? 'index.html' : lowerPath + '.html';
    }

    return lowerPath;
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function normalizeGoogleFormEmbedUrl(value) {
    var content = String(value || '').trim();
    var iframeMatch;

    if (!content) {
      return '';
    }

    if (content.indexOf('REPLACE_ME') !== -1) {
      return '';
    }

    iframeMatch = content.match(/src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) {
      content = iframeMatch[1].trim();
    }

    if (!/^https?:\/\//i.test(content)) {
      return '';
    }

    if (/forms\.gle\//i.test(content)) {
      return '';
    }

    if (/docs\.google\.com\/forms\//i.test(content) && !/[?&]embedded=true(?:&|$)/i.test(content)) {
      content += (content.indexOf('?') === -1 ? '?' : '&') + 'embedded=true';
    }

    return content;
  }

  function deriveGoogleFormUrl(value, embedValue) {
    var content = String(value || '').trim();
    var embedUrl;

    if (content && content.indexOf('REPLACE_ME') === -1) {
      return content;
    }

    embedUrl = normalizeGoogleFormEmbedUrl(embedValue);
    if (!embedUrl) {
      return '';
    }

    return embedUrl
      .replace(/([?&])embedded=true(&?)/i, function (match, prefix, suffix) {
        if (prefix === '?' && suffix) {
          return '?';
        }
        if (prefix === '&' && suffix) {
          return '&';
        }
        return '';
      })
      .replace(/[?&]$/, '');
  }

  function normalizeFrameHeight(value, fallback) {
    var height = parseInt(value, 10);
    if (isNaN(height) || height < 600) {
      return fallback;
    }
    return height;
  }

  function fetchJson(path) {
    return fetch(path, { cache: 'no-store' }).then(function (response) {
      if (!response.ok) {
        throw new Error('Unable to load ' + path);
      }
      return response.json();
    });
  }

  function emitRendered() {
    document.dispatchEvent(new CustomEvent('cms:rendered'));
  }

  function buildBlogCard(item) {
    return '' +
      '<article class="col-lg-4 col-sm-6 mb-5">' +
      '  <div class="card rounded-0 border-bottom border-primary border-top-0 border-left-0 border-right-0 hover-shadow h-100">' +
      '    <img class="card-img-top rounded-0" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
      '    <div class="card-body">' +
      '      <ul class="list-inline mb-3">' +
      '        <li class="list-inline-item mr-3 ml-0">' + escapeHtml(item.category) + '</li>' +
      '        <li class="list-inline-item mr-3 ml-0">' + escapeHtml(item.tag) + '</li>' +
      '      </ul>' +
      '      <a href="blog-single.html?slug=' + encodeURIComponent(item.slug) + '"><h4 class="card-title">' + escapeHtml(item.title) + '</h4></a>' +
      '      <div class="card-text rich-text-content mb-4">' + richTextMarkup(item.excerpt, 'p') + '</div>' +
      '      <a href="blog-single.html?slug=' + encodeURIComponent(item.slug) + '" class="btn btn-primary btn-sm">Đọc bài</a>' +
      '    </div>' +
      '  </div>' +
      '</article>';
  }

  function buildCourseCard(item) {
    return '' +
      '<div class="col-lg-4 col-sm-6 mb-5">' +
      '  <div class="card p-0 border-primary rounded-0 hover-shadow h-100">' +
      '    <img class="card-img-top rounded-0" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
      '    <div class="card-body">' +
      '      <ul class="list-inline mb-2">' +
      '        <li class="list-inline-item"><i class="ti-time mr-1 text-color"></i>' + escapeHtml(item.duration) + '</li>' +
      '        <li class="list-inline-item">' + escapeHtml(item.audienceLabel) + '</li>' +
      '      </ul>' +
      '      <a href="course-single.html?slug=' + encodeURIComponent(item.slug) + '"><h4 class="card-title">' + escapeHtml(item.title) + '</h4></a>' +
      '      <div class="card-text rich-text-content mb-4">' + richTextMarkup(item.excerpt, 'p') + '</div>' +
      '      <a href="course-single.html?slug=' + encodeURIComponent(item.slug) + '" class="btn btn-primary btn-sm">Xem chi tiết</a>' +
      '    </div>' +
      '  </div>' +
      '</div>';
  }

  function buildFeedbackCard(item) {
    return '' +
      '<div class="col-lg-4 col-sm-6 mb-5">' +
      '  <div class="testimonial-card h-100">' +
      '    <img class="img-fluid w-100 mb-4" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">' +
      '    <p class="feedback-name mb-2">' + escapeHtml(item.name) + '</p>' +
      '    <h4 class="mb-3">' + escapeHtml(item.title) + '</h4>' +
      '    <div class="rich-text-content feedback-quote mb-0">' + richTextMarkup(item.quote, 'p') + '</div>' +
      '  </div>' +
      '</div>';
  }

  function buildFeedbackPreviewCard(item) {
    return '' +
      '<div class="col-lg-4 col-sm-6 mb-5 mb-lg-0">' +
      '  <div class="card border-0 rounded-0 hover-shadow">' +
      '    <img class="card-img-top rounded-0" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '">' +
      '    <div class="card-body">' +
      '      <p class="feedback-name mb-2">' + escapeHtml(item.name) + '</p>' +
      '      <a href="feedback.html"><h4 class="card-title">' + escapeHtml(item.message) + '</h4></a>' +
      '      <div class="rich-text-content mb-3">' + richTextMarkup(item.quote, 'p') + '</div>' +
      '      <a href="feedback.html" class="btn btn-sm btn-outline-primary">Xem thêm</a>' +
      '    </div>' +
      '  </div>' +
      '</div>';
  }

  function buildResourceCard(item) {
    return '' +
      '<div class="col-lg-4 mb-4">' +
      '  <div class="resource-card h-100">' +
      '    <img class="img-fluid w-100 mb-4" src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
      '    <span class="section-label">' + escapeHtml(item.label) + '</span>' +
      '    <h3 class="mb-3">' + escapeHtml(item.title) + '</h3>' +
      '    <div class="rich-text-content mb-4">' + richTextMarkup(item.description, 'p') + '</div>' +
      '    <a href="' + escapeHtml(item.url) + '" class="btn btn-outline-primary" target="_blank" rel="noopener">' + escapeHtml(item.buttonLabel) + '</a>' +
      '  </div>' +
      '</div>';
  }

  function applyGlobal(site) {
    document.title = site.defaultMetaTitle || site.siteName;
    var metaDescription = qs('#cms-meta-description');
    if (metaDescription) {
      metaDescription.setAttribute('content', site.defaultMetaDescription || '');
    }
    var metaAuthor = qs('#cms-meta-author');
    if (metaAuthor) {
      metaAuthor.setAttribute('content', site.siteName || '');
    }
    var shortcut = qs('#cms-favicon-shortcut');
    var icon = qs('#cms-favicon-icon');
    if (shortcut) {
      shortcut.setAttribute('href', site.favicon || 'images/favicon.png');
    }
    if (icon) {
      icon.setAttribute('href', site.favicon || 'images/favicon.png');
    }

    setImage('.cms-logo', site.logo, site.siteName);
    setHtml('.cms-brand-description', richTextMarkup(site.brandDescription, 'p'));
    setText('.cms-hotline-text', site.hotlineText);
    setLink('.cms-hotline-link', site.hotlineHref);
    setText('.cms-email-text', site.emailText);
    setLink('.cms-email-link', site.emailHref);
    setText('.cms-zalo-text', site.zaloText);
    setLink('.cms-zalo-link', site.zaloUrl);
    setText('.cms-facebook-text', site.facebookText);
    setLink('.cms-facebook-link', site.facebookUrl);
    setText('.cms-address-text', site.address);
    setText('#cms-copyright-text', site.copyright);
  }

  function setPageMeta(title, description, site) {
    document.title = title ? title + ' | ' + site.siteName : site.defaultMetaTitle || site.siteName;
    var metaDescription = qs('#cms-meta-description');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', stripHtml(description));
    }
  }

  function setPageBanner(parentText, parentUrl, currentTitle, description) {
    if (qs('#cms-page-parent-link')) {
      qs('#cms-page-parent-link').textContent = parentText;
      qs('#cms-page-parent-link').setAttribute('href', parentUrl);
    }
    setText('#cms-page-current-title', currentTitle);
    setText('#cms-page-description', stripHtml(description));
  }

  function renderHome(site, home, blogPosts, courses, feedback) {
    setDataBackground('#cms-home-hero', home.heroBackground);
    var heroSlider = qs('#cms-home-hero-slider');
    if (heroSlider) {
      heroSlider.innerHTML = (home.heroSlides || []).map(function (slide) {
        return '' +
          '<div class="hero-slider-item">' +
          '  <div class="row">' +
          '    <div class="col-md-8">' +
          '      <h1 class="text-white">' + escapeHtml(slide.title) + '</h1>' +
          '      <div class="text-muted mb-4 rich-text-content">' + richTextMarkup(slide.description, 'p') + '</div>' +
          '      <a href="' + escapeHtml(slide.buttonUrl) + '" class="btn btn-primary">' + escapeHtml(slide.buttonLabel) + '</a>' +
          '    </div>' +
          '  </div>' +
          '</div>';
      }).join('');
    }

    setImage('#cms-home-feature-image', home.featureImage, 'Feature image');
    setHtml('#cms-home-features', (home.features || []).map(function (feature) {
      return '' +
        '<div class="col-sm-6 col-xl-5 mb-xl-5 mb-lg-3 mb-4 text-center text-sm-left">' +
        '  <i class="' + escapeHtml(feature.icon) + ' mb-xl-4 mb-lg-3 mb-4 feature-icon"></i>' +
        '  <h3 class="mb-xl-4 mb-lg-3 mb-4">' + escapeHtml(feature.title) + '</h3>' +
        '  <div class="rich-text-content">' + richTextMarkup(feature.description, 'p') + '</div>' +
        '</div>';
    }).join(''));

    setText('#cms-home-about-title', home.aboutPreview.title);
    setHtml('#cms-home-about-body', resolveRichText(home.aboutPreview.body, home.aboutPreview.paragraphs, 'p'));
    setText('#cms-home-about-button', home.aboutPreview.buttonLabel);
    setLink('#cms-home-about-button', home.aboutPreview.buttonUrl);
    setImage('#cms-home-about-image', home.aboutPreview.image, home.aboutPreview.title);

    setText('#cms-home-course-title', home.courseSectionTitle);
    setRichText('#cms-home-course-text', home.courseSectionText, 'p');
    setText('#cms-home-cta-eyebrow', home.cta.eyebrow);
    setText('#cms-home-cta-title', home.cta.title);
    setText('#cms-home-cta-button', home.cta.buttonLabel);
    setLink('#cms-home-cta-button', home.cta.buttonUrl);

    setDataBackground('#cms-home-video-section', home.video.backgroundImage);
    setLink('#cms-home-video-link', home.video.videoUrl);
    setText('#cms-home-video-title', home.video.title);
    setRichText('#cms-home-video-description', home.video.description, 'p');
    setHtml('#cms-home-video-points', (home.video.points || []).map(function (entry) {
      return '<li>' + escapeHtml(entry) + '</li>';
    }).join(''));
    setText('#cms-home-video-button', home.video.buttonLabel);
    setLink('#cms-home-video-button', home.video.buttonUrl);

    setText('#cms-home-feedback-title', home.feedbackSectionTitle);
    setRichText('#cms-home-feedback-text', home.feedbackSectionText, 'p');
    setText('#cms-home-blog-title', home.blogSectionTitle);
    setRichText('#cms-home-blog-text', home.blogSectionText, 'p');

    var featuredCourses = (courses.items || []).filter(function (item) { return item.featured; }).slice(0, 3);
    var featuredPosts = (blogPosts.items || []).filter(function (item) { return item.featured; }).slice(0, 3);
    var featuredFeedback = (feedback.items || []).filter(function (item) { return item.featured; }).slice(0, 3);

    setHtml('#cms-course-list', featuredCourses.map(buildCourseCard).join(''));
    setHtml('#cms-blog-list', featuredPosts.map(buildBlogCard).join(''));
    setHtml('#cms-feedback-preview-list', featuredFeedback.map(buildFeedbackPreviewCard).join(''));

    setPageMeta(site.defaultMetaTitle, site.defaultMetaDescription, site);
  }

  function renderArchivePage(pageData, archiveSelector, builder, items, site, parentTitle) {
    setPageMeta(pageData.pageTitle, pageData.pageDescription, site);
    setPageBanner('Trang chủ', 'index.html', pageData.pageTitle, pageData.pageDescription);
    if (pageData.introEyebrow) {
      setText('#cms-' + parentTitle + '-intro-eyebrow', pageData.introEyebrow);
    }
    if (pageData.introTitle) {
      setText('#cms-' + parentTitle + '-intro-title', pageData.introTitle);
    }
    if (pageData.introText) {
      setRichText('#cms-' + parentTitle + '-intro-text', pageData.introText, 'p');
    }
    if (pageData.cta) {
      setText('#cms-' + parentTitle + '-cta-title', pageData.cta.title);
      setRichText('#cms-' + parentTitle + '-cta-body', pageData.cta.body, 'p');
      setText('#cms-' + parentTitle + '-cta-button', pageData.cta.buttonLabel);
      setLink('#cms-' + parentTitle + '-cta-button', pageData.cta.buttonUrl);
    }
    setHtml(archiveSelector, (items || []).map(builder).join(''));
  }

  function renderBlogSingle(site, blogPosts) {
    var slug = getQueryParam('slug');
    var item = (blogPosts.items || []).find(function (post) { return post.slug === slug; }) || (blogPosts.items || [])[0];
    if (!item) {
      return;
    }

    setPageMeta(item.seoTitle || item.title, item.seoDescription || item.excerpt, site);
    setPageBanner('Blog', 'blog.html', item.title, item.excerpt);
    setImage('#cms-blog-single-image', item.image, item.title);
    setText('#cms-blog-single-category', item.category);
    setText('#cms-blog-single-tag', item.tag);
    setLink('#cms-blog-single-inline-link', item.ctaUrl);
    setText('#cms-blog-single-inline-text', item.ctaLabel);
    setText('#cms-blog-single-title', item.title);
    setRichText('#cms-blog-single-intro', item.intro, 'p');
    setHtml('#cms-blog-single-sections', (item.sections || []).map(function (section) {
      return '' +
        '<div class="mb-5">' +
        '  <h3 class="mt-5 mb-3">' + escapeHtml(section.heading) + '</h3>' +
        '  <div class="rich-text-content">' + richTextMarkup(section.body, 'p') + '</div>' +
             listMarkup(section.items, 'list-styled') +
        '</div>';
    }).join(''));
    setText('#cms-blog-single-button', item.ctaLabel);
    setLink('#cms-blog-single-button', item.ctaUrl);

    var related = (blogPosts.items || []).filter(function (post) { return post.slug !== item.slug; }).slice(0, 3);
    setHtml('#cms-blog-related', related.map(buildBlogCard).join(''));
  }

  function renderCourseSingle(site, courses) {
    var slug = getQueryParam('slug');
    var item = (courses.items || []).find(function (course) { return course.slug === slug; }) || (courses.items || [])[0];
    if (!item) {
      return;
    }

    setPageMeta(item.seoTitle || item.title, item.seoDescription || item.excerpt, site);
    setPageBanner('Khóa học', 'courses.html', item.title, item.excerpt);
    setImage('#cms-course-single-image', item.image, item.title);
    setText('#cms-course-single-title', item.title);
    setText('#cms-course-single-audience-label', item.audienceLabel);
    setText('#cms-course-single-duration', item.duration);
    setText('#cms-course-single-price', item.priceText);
    setLink('#cms-course-single-button', item.ctaUrl);
    setText('#cms-course-single-button', item.ctaLabel);
    setRichText('#cms-course-single-overview', item.overview, 'p');
    setHtml('#cms-course-single-audience', '' +
      '<div class="col-md-6">' + listMarkup(item.audience, 'list-styled') + '</div>' +
      '<div class="col-md-6">' + listMarkup(item.outcomes, 'list-styled') + '</div>');
    setHtml('#cms-course-single-curriculum', (item.curriculum || []).map(function (entry) {
      return '<li>' + escapeHtml(entry) + '</li>';
    }).join(''));
    setHtml('#cms-course-single-outcomes', (item.outcomes || []).map(function (entry) {
      return '<li>' + escapeHtml(entry) + '</li>';
    }).join(''));
    setText('#cms-course-single-secondary-button', item.secondaryLabel);
    setLink('#cms-course-single-secondary-button', item.secondaryUrl);

    var related = (courses.items || []).filter(function (course) { return course.slug !== item.slug; }).slice(0, 3);
    setHtml('#cms-course-related', related.map(buildCourseCard).join(''));
  }

  function renderAbout(site, about) {
    setPageMeta(about.pageTitle, about.pageDescription, site);
    setPageBanner('Trang chủ', 'index.html', about.pageTitle, about.pageDescription);
    setImage('#cms-about-hero-image', about.heroImage, about.title);
    setText('#cms-about-eyebrow', about.eyebrow);
    setText('#cms-about-title', about.title);
    setHtml('#cms-about-body', resolveRichText(about.body, about.paragraphs, 'p'));
    setHtml('#cms-about-cards', (about.cards || []).map(function (card) {
      return '' +
        '<div class="col-lg-4 mb-4">' +
        '  <div class="info-card h-100">' +
        '    <h3 class="mb-3">' + escapeHtml(card.title) + '</h3>' +
        '    <div class="rich-text-content mb-0">' + richTextMarkup(card.body, 'p') + '</div>' +
        '  </div>' +
        '</div>';
    }).join(''));
    setHtml('#cms-about-stats', (about.stats || []).map(function (stat) {
      return '' +
        '<div class="col-md-3 col-sm-6 mb-4">' +
        '  <div class="contact-card text-center h-100">' +
        '    <h2 class="text-primary">' + escapeHtml(stat.number) + '</h2>' +
        '    <h5>' + escapeHtml(stat.title) + '</h5>' +
        '    <div class="rich-text-content mb-0">' + richTextMarkup(stat.body, 'p') + '</div>' +
        '  </div>' +
        '</div>';
    }).join(''));
    setText('#cms-about-cta-title', about.cta.title);
    setRichText('#cms-about-cta-body', about.cta.body, 'p');
    setText('#cms-about-cta-button', about.cta.buttonLabel);
    setLink('#cms-about-cta-button', about.cta.buttonUrl);
  }

  function renderContact(site, contact) {
    var embedUrl = normalizeGoogleFormEmbedUrl(contact.googleFormEmbed || contact.googleFormUrl);
    var formUrl = deriveGoogleFormUrl(contact.googleFormUrl, contact.googleFormEmbed);
    var frameHeight = normalizeFrameHeight(contact.googleFormHeight, 980);

    setPageMeta(contact.pageTitle, contact.pageDescription, site);
    setPageBanner('Trang chủ', 'index.html', contact.pageTitle, contact.pageDescription);
    setText('#cms-contact-form-title', contact.formTitle);
    setRichText('#cms-contact-form-description', contact.formDescription, 'p');
    setText('#cms-contact-form-button', contact.googleFormLabel);
    setLink('#cms-contact-form-button', formUrl);
    setAttribute('#cms-contact-form-iframe', 'src', embedUrl);
    setAttribute('#cms-contact-form-iframe', 'title', contact.formTitle || 'Google Form');
    setAttribute('#cms-contact-form-iframe', 'height', String(frameHeight));
    qsa('#cms-contact-form-iframe').forEach(function (node) {
      node.style.height = frameHeight + 'px';
    });
    setVisible('#cms-contact-form-embed', Boolean(embedUrl));
    setVisible('#cms-contact-form-button', Boolean(formUrl));
    setVisible('#cms-contact-form-empty', !embedUrl && !formUrl);
    setText('#cms-contact-helper-title', contact.helperTitle);
    setRichText('#cms-contact-helper-body', contact.helperBody, 'p');
    setHtml('#cms-contact-steps', (contact.steps || []).map(function (step) {
      return '' +
        '<div class="col-md-4 mb-4">' +
        '  <div class="info-card text-center h-100">' +
        '    <h3 class="mb-3">' + escapeHtml(step.title) + '</h3>' +
        '    <div class="rich-text-content mb-0">' + richTextMarkup(step.body, 'p') + '</div>' +
        '  </div>' +
        '</div>';
    }).join(''));
  }

  function renderResources(site, pageData, resources) {
    setPageMeta(pageData.pageTitle, pageData.pageDescription, site);
    setPageBanner('Trang chủ', 'index.html', pageData.pageTitle, pageData.pageDescription);
    setText('#cms-resources-intro-eyebrow', pageData.introEyebrow);
    setText('#cms-resources-intro-title', pageData.introTitle);
    setRichText('#cms-resources-intro-text', pageData.introText, 'p');
    setHtml('#cms-resources-list', (resources.items || []).map(buildResourceCard).join(''));
    setImage('#cms-resources-showcase-image', pageData.showcase.image, pageData.showcase.title);
    setText('#cms-resources-showcase-eyebrow', pageData.showcase.eyebrow);
    setText('#cms-resources-showcase-title', pageData.showcase.title);
    setRichText('#cms-resources-showcase-body', pageData.showcase.body, 'p');
    setText('#cms-resources-showcase-button', pageData.showcase.buttonLabel);
    setLink('#cms-resources-showcase-button', pageData.showcase.buttonUrl);
  }

  function renderFeedback(site, pageData, feedback) {
    setPageMeta(pageData.pageTitle, pageData.pageDescription, site);
    setPageBanner('Trang chủ', 'index.html', pageData.pageTitle, pageData.pageDescription);
    setText('#cms-feedback-intro-eyebrow', pageData.introEyebrow);
    setText('#cms-feedback-intro-title', pageData.introTitle);
    setRichText('#cms-feedback-intro-text', pageData.introText, 'p');
    setHtml('#cms-feedback-list', (feedback.items || []).map(buildFeedbackCard).join(''));
    setText('#cms-feedback-messages-title', pageData.messagesTitle);
    setHtml('#cms-feedback-messages', resolveRichText(pageData.messagesBody, pageData.messages, 'p'));
    setText('#cms-feedback-video-eyebrow', pageData.videoEyebrow);
    setText('#cms-feedback-video-title', pageData.videoTitle);
    setRichText('#cms-feedback-video-body', pageData.videoBody, 'p');
    setLink('#cms-feedback-video-link', pageData.videoUrl);
    setText('#cms-feedback-cta-title', pageData.cta.title);
    setRichText('#cms-feedback-cta-body', pageData.cta.body, 'p');
    setText('#cms-feedback-cta-button', pageData.cta.buttonLabel);
    setLink('#cms-feedback-cta-button', pageData.cta.buttonUrl);
  }

  Promise.all([
    fetchJson(DATA_FILES.site),
    fetchJson(DATA_FILES.home),
    fetchJson(DATA_FILES.about),
    fetchJson(DATA_FILES.contact),
    fetchJson(DATA_FILES.blogPage),
    fetchJson(DATA_FILES.coursesPage),
    fetchJson(DATA_FILES.resourcesPage),
    fetchJson(DATA_FILES.feedbackPage),
    fetchJson(DATA_FILES.blogPosts),
    fetchJson(DATA_FILES.courses),
    fetchJson(DATA_FILES.feedback),
    fetchJson(DATA_FILES.resources)
  ]).then(function (responses) {
    var site = responses[0];
    var home = responses[1];
    var about = responses[2];
    var contact = responses[3];
    var blogPage = responses[4];
    var coursesPage = responses[5];
    var resourcesPage = responses[6];
    var feedbackPage = responses[7];
    var blogPosts = responses[8];
    var courses = responses[9];
    var feedback = responses[10];
    var resources = responses[11];

    applyGlobal(site);

    switch (getPageName()) {
      case 'index.html':
      case '':
        renderHome(site, home, blogPosts, courses, feedback);
        break;
      case 'blog.html':
        renderArchivePage(blogPage, '#cms-blog-archive', buildBlogCard, blogPosts.items, site, 'blog');
        break;
      case 'blog-single.html':
        renderBlogSingle(site, blogPosts);
        break;
      case 'courses.html':
        renderArchivePage(coursesPage, '#cms-courses-archive', buildCourseCard, courses.items, site, 'courses');
        break;
      case 'course-single.html':
        renderCourseSingle(site, courses);
        break;
      case 'about.html':
        renderAbout(site, about);
        break;
      case 'contact.html':
        renderContact(site, contact);
        break;
      case 'resources.html':
        renderResources(site, resourcesPage, resources);
        break;
      case 'feedback.html':
        renderFeedback(site, feedbackPage, feedback);
        break;
      default:
        break;
    }

    emitRendered();
  }, function (error) {
    console.error('[CMS]', error);
  });
})();
