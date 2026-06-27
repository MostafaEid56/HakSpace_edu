package com.hakspace.exception;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    /** Bean validation errors (@Valid) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex, Locale locale) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", errors));
    }

    /** Business-logic RuntimeExceptions thrown by controllers */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex, Locale locale) {
        // If the message looks like a message key (no spaces, dot-separated), resolve it
        String msg = ex.getMessage();
        if (msg != null && msg.matches("[a-z][a-z0-9]*(\\.[a-z][a-z0-9]*)+")) {
            msg = messageSource.getMessage(msg, null, msg, locale);
        }
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", msg));
    }

    /** Catch-all */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneral(Exception ex, Locale locale) {
        String msg = messageSource.getMessage("error.general", null, locale);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", msg));
    }
}