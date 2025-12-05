import React from 'react';
import { FieldHelp } from "./FieldHelp";

export function BuildingParameterInput({ 
    label, 
    subscript, 
    value, 
    onChange, 
    placeholder = "0", 
    unit = "m²",
    isReadOnly = false,
    helpText,
    inputMode = "decimal"
}) {
    if (isReadOnly) {
        return (
            <tr className="border-t border-[#E5E7EB] h-[45px]">
                <td className="py-2 px-3 text-sm font-medium text-gray-700">
                    {helpText ? (
                        <div className="flex items-center gap-2">
                            <span>{label}<sub className="text-[0.7em]">{subscript}</sub></span>
                            <FieldHelp text={helpText} />
                        </div>
                    ) : (
                        <span>{label}<sub className="text-[0.7em]">{subscript}</sub></span>
                    )}
                </td>
                <td className="py-2 px-3 text-sm font-semibold text-[#1080c2] text-right">
                    {value > 0 ? `${value.toFixed(2)} ${unit}` : "—"}
                </td>
            </tr>
        );
    }

    return (
        <tr className="border-t border-[#E5E7EB] h-[45px]">
            <td className="py-2 px-3 text-sm font-medium text-gray-700">
                {helpText ? (
                    <div className="flex items-center gap-2">
                        <span>{label}<sub className="text-[0.7em]">{subscript}</sub></span>
                        <FieldHelp text={helpText} />
                    </div>
                ) : (
                    <span>{label}<sub className="text-[0.7em]">{subscript}</sub></span>
                )}
            </td>
            <td className="py-2 px-3">
                <div className="relative w-[60%] ml-auto">
                    <input
                        type="text"
                        inputMode={inputMode}
                        value={value}
                        onChange={onChange}
                        className="w-full px-3 py-2 pr-12 rounded-lg border border-[#E5E7EB] bg-gray-50 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2]"
                        placeholder={placeholder}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{unit}</span>
                </div>
            </td>
        </tr>
    );
}
