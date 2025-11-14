package com.backend.model.exception;
public class CustomException extends RuntimeException
{
    public CustomException(String Str)
    {
        super(Str);
    }
}