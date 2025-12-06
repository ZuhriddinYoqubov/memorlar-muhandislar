// 1-bosqich: Dastlabki ma'lumotlar
import React from "react";
import { CustomSelect, CustomRegionSelect } from "./HeatSelects";
import { ProtectionLevelInfoModal } from "./InfoModals";

export function InitialStep({
  initial,
  setInitial,
  climate,
  setClimate,
  initialErrors,
  setInitialErrors,
  heatingSeason,
  showProtectionInfo,
  setShowProtectionInfo,
  handleClimate,
  // Loyiha ma'lumotlari
  projectData,
  setProjectData
}) {
  return (
    <div className="space-y-6">
      {/* 0) Obekt nomi */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Obekt nomi</label>
        <textarea
          value={initial.objectName}
          onChange={(e) => {
            const val = e.target.value;
            setInitial((s) => ({ ...s, objectName: val }));
            if (val && val.trim()) {
              setInitialErrors((err) => ({ ...err, objectName: false }));
            }
          }}
          rows={2}
          className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] resize-y ${
            initialErrors.objectName ? "border-red-400" : "border-[#E5E7EB]"
          }`}
          placeholder="Obekt nomini kiriting"
        />
      </div>

      {/* 1) Obekt turi */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Obekt turi</label>
        <CustomSelect
          value={initial.objectType}
          onChange={(val) => {
            setInitial((s) => ({ ...s, objectType: val }));
            setInitialErrors((err) => ({ ...err, objectType: false }));
          }}
          error={initialErrors.objectType}
          placeholder="Tanlang"
          options={[
            {
              value: "1",
              label:
                "Turar joy, davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar (3 qavatgacha)",
            },
            {
              value: "2",
              label:
                "Turar joy, davolash-profilaktika va bolalar muassasalari, o'quv yurtlari, internatlar (3 qavatdan yuqori)",
            },
            {
              value: "3",
              label:
                "Jamoat binolari, 1-bandda ko'rsatilgandan tashqari, ma'muriy va maishiy binolar, nam va ho'l rejimli xonalarni istisno qilganda",
            },
            { value: "4", label: "Quruq va normal rejimli ishlab chiqarish binolari" },
            { value: "5", label: "Nam va ho'l rejimli ishlab chiqarish xonalari va boshqa xonalar" },
            { value: "6", label: "Kartoshka va sabzavot omborlari" },
            {
              value: "7",
              label:
                "Issiqligi keragidan ortiq bo'lgan (23 Vt/m3 dan ortiq) va ichki havosining hisobiy nisbiy namligi 50%dan oshmagan ishlab chiqarish binolari",
            },
          ]}
        />
      </div>

      {/* 2) Hudud (CustomRegionSelect) + Issiqlik himoyasi darajasi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Hudud</label>
          <CustomRegionSelect
            province={initial.province}
            regionId={initial.region}
            error={initialErrors.province || initialErrors.region}
            onSelectProvince={(prov) => {
              setInitial((s) => ({ ...s, province: prov, region: "" }));
              setInitialErrors((err) => ({ ...err, province: false, region: false }));
            }}
            onSelectDistrict={(id, tOut) => {
              setInitial((s) => ({ ...s, region: id }));
              setInitialErrors((err) => ({ ...err, region: false }));
              if (typeof tOut === "number") {
                setClimate((c) => ({ ...c, t_out: Number(tOut) }));
              }
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <span>Issiqlik himoyasi darajasi</span>
            <button
              type="button"
              className="w-4 h-4 flex items-center justify-center rounded-full border border-gray-400 text-[10px] text-gray-600 hover:bg-gray-100"
              onClick={() => setShowProtectionInfo(true)}
              aria-label="Issiqlik himoyasi darajasi haqida ma'lumot"
            >
              ?
            </button>
          </label>
          <CustomSelect
            value={initial.protectionLevel}
            onChange={(val) => {
              setInitial((s) => ({ ...s, protectionLevel: val }));
              setInitialErrors((err) => ({ ...err, protectionLevel: false }));
            }}
            error={initialErrors.protectionLevel}
            placeholder="Tanlang"
            options={[
              { value: "I", label: "I" },
              { value: "II", label: "II" },
              { value: "III", label: "III" },
            ]}
          />

          <ProtectionLevelInfoModal 
            open={showProtectionInfo} 
            onClose={() => setShowProtectionInfo(false)} 
          />
        </div>
      </div>
      
      {/* 3) t_i va φ_i bir qatorda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ichki havoning hisobiy harorati t
            <sub className="align-baseline text-[0.7em]">i</sub> °C
          </label>
          <input
            type="number"
            name="t_in"
            value={climate.t_in}
            onChange={(e) => {
              handleClimate(e);
              const val = e.target.value;
              if (val !== "" && val != null) {
                setInitialErrors((err) => ({ ...err, t_in: false }));
              }
            }}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] ${
              initialErrors.t_in ? "border-red-400" : "border-[#E5E7EB]"
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nisbiy namlik, φ
            <sub className="align-baseline text-[0.7em]">i</sub> %
          </label>
          <input
            type="number"
            name="phi_in"
            value={climate.phi_in}
            onChange={(e) => {
              handleClimate(e);
              const val = e.target.value;
              if (val !== "" && val != null) {
                setInitialErrors((err) => ({ ...err, phi_in: false }));
              }
            }}
            className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] ${
              initialErrors.phi_in ? "border-red-400" : "border-[#E5E7EB]"
            }`}
          />
        </div>
      </div>

      {/* 5) Loyiha ma'lumotlari */}
      
        
        {/* Ishlab chiqdi va Aloqa telefoni - yonma-yon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Ishlab chiqdi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ishlab chiqdi:</label>
            <input
              type="text"
              value={initial.preparedBy}
              onChange={(e) => {
                const val = e.target.value;
                setInitial((s) => ({ ...s, preparedBy: val }));
                if (val && val.trim()) {
                  setInitialErrors((err) => ({ ...err, preparedBy: false }));
                }
              }}
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] ${
                initialErrors.preparedBy ? "border-red-400" : "border-[#E5E7EB]"
              }`}
              placeholder="F.I.Sh. yoki tashkilot nomi"
            />
          </div>

          {/* Aloqa telefoni */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Aloqa telefoni:</label>
            <input
              type="text"
              value={projectData.contactPhone}
              onChange={(e) => {
                const val = e.target.value;
                setProjectData((s) => ({ ...s, contactPhone: val }));
              }}
              className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] border-[#E5E7EB]"
              placeholder="+998 XX XXX-XX-XX"
            />
          </div>
        </div>

        {/* Loyiha tashkiloti */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Loyiha tashkiloti:</label>
          <input
            type="text"
            value={projectData.organization}
            onChange={(e) => {
              const val = e.target.value;
              setProjectData((s) => ({ ...s, organization: val }));
            }}
            className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] border-[#E5E7EB]"
            placeholder="Tashkilot nomi"
          />
        </div>

        {/* Loyihachi manzili */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Loyihachi manzili:</label>
          <input
            type="text"
            value={projectData.designerAddress}
            onChange={(e) => {
              const val = e.target.value;
              setProjectData((s) => ({ ...s, designerAddress: val }));
            }}
            className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] border-[#E5E7EB]"
            placeholder="Manzil"
          />
        </div>

        {/* Obekt manzili */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Obekt manzili:</label>
          <input
            type="text"
            value={projectData.objectAddress}
            onChange={(e) => {
              const val = e.target.value;
              setProjectData((s) => ({ ...s, objectAddress: val }));
            }}
            className="w-full px-4 py-3 rounded-xl border bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1080c2]/60 focus:border-[#1080c2] border-[#E5E7EB]"
            placeholder="Obekt joylashuvi"
          />
        </div>
      </div>
    
  );
}
