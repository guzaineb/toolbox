"use client";

import { Button } from "./ui";
import { useState, useEffect } from "react";
import { Step3Data, Step3Errors } from "@/types/register";
import { ExpertForm, IncubatorMemberForm, ProjectOwnerForm } from "./Step3RoleForms";

interface Step3FormProps {
    t: any;
    loading: boolean;
    data: Partial<Step3Data>; // Add data prop
    errors: Step3Errors; // Add errors prop
    onFieldChange: (key: keyof Step3Data, value: any) => void; // Add field change handler
    onSubmit: () => void;
    onSkip: () => void;
}

export function Step3Form({ 
    t, 
    loading, 
    data, 
    errors, 
    onFieldChange, 
    onSubmit, 
    onSkip 
}: Step3FormProps) {
    // Sync local role with parent state
    const [role, setRole] = useState<"project_owner" | "expert" | "incubator_member" | null>(
        data.role || null
    );

    const roles = [
        { id: "project_owner" as const, title: "Porteur de projet", desc: "Je souhaite développer mon projet" },
        { id: "expert" as const, title: "Expert", desc: "J'accompagne des projets en tant qu'expert" },
        { id: "incubator_member" as const, title: "Membre incubateur", desc: "Je gère un incubateur" },
    ];

    // Update parent state when role changes
    useEffect(() => {
        if (role) {
            onFieldChange("role", role);
        }
    }, [role, onFieldChange]);

    const handleRoleSelect = (selectedRole: typeof roles[number]['id']) => {
        setRole(selectedRole);
    };

    const handleSubmit = () => {
        if (role) {
            onSubmit();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">{t.chooseRole || "Choisissez votre rôle principal"}</h3>
            <p className="text-xs text-gray-500">
                {t.roleDescription || "Vous pourrez en changer plus tard dans votre profil."}
            </p>

            {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role}</p>
            )}

            <div className="grid md:grid-cols-2 gap-3">
                {roles.map((r) => (
                    <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleSelect(r.id)}
                        className={`p-4 rounded-xl border-2 transition-all group hover:shadow-md text-left ${
                            role === r.id
                                ? "border-violet-500 bg-violet-50 shadow-md"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                        <h4 className="font-semibold text-gray-900 mb-1">{r.title}</h4>
                        <p className="text-xs text-gray-500">{r.desc}</p>
                    </button>
                ))}
            </div>

            {/* Role-specific forms */}
            {role === "expert" && (
                <ExpertForm
                    data={data}
                    errors={errors}
                    onFieldChange={onFieldChange}
                />
            )}

            {role === "project_owner" && (
                <ProjectOwnerForm
                    data={data}
                    errors={errors}
                    onFieldChange={onFieldChange}
                />
            )}

            {role === "incubator_member" && (
                <IncubatorMemberForm />
            )}

            <div className="flex gap-3 pt-4">
                <Button 
                    type="button" 
                    fullWidth 
                    variant="outline" 
                    onClick={onSkip} 
                    disabled={loading}
                >
                    {t.skipBtn || "Passer (plus tard)"}
                </Button>
                <Button 
                    type="submit" 
                    fullWidth 
                    loading={loading} 
                    disabled={!role}
                    onClick={handleSubmit}
                >
                    {t.continueBtn || `Continuer avec ${roles.find(r => r.id === role)?.title || "ce rôle"}`}
                </Button>
            </div>
        </div>
    );
}