package com.hakspace.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.List;
import java.util.Locale;

/**
 * Configures Spring MessageSource for backend i18n.
 *
 * <p>Language is resolved from the {@code Accept-Language} HTTP header sent
 * by the frontend (e.g. {@code Accept-Language: ar} when Arabic is active).
 * Supported locales: {@code en} (default), {@code ar}.
 */
@Configuration
public class LocaleConfig {

    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource src = new ResourceBundleMessageSource();
        src.setBasename("messages");
        src.setDefaultEncoding("UTF-8");
        src.setUseCodeAsDefaultMessage(true); // return key if translation missing
        return src;
    }

    @Bean
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setSupportedLocales(List.of(Locale.ENGLISH, new Locale("ar")));
        resolver.setDefaultLocale(Locale.ENGLISH);
        return resolver;
    }
}
