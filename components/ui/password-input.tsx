"use client"

import { useState } from "react"
import { Input } from "./input"
import { Button } from "./button"
import { Eye, EyeOff } from "lucide-react"

interface PasswordInputProps {
    id: string
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
    disabled?: boolean
    className?: string
}

export function PasswordInput({
    id,
    placeholder = "Enter password",
    value,
    onChange,
    required = false,
    disabled = false,
    className = "",
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false)

    return (
        <div className="relative">
            <Input
                id={id}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`pr-12 ${className}`}
            />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
            >
                {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                )}
            </Button>
        </div>
    )
}
