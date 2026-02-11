import { useState, useEffect, useMemo } from 'react'

import Header              from './Header'
import CharacterCard       from './CharacterCard'
import RoleSelector        from './RoleSelector'
import ProTips             from './ProTips'
import BuildResults        from './BuildResults'
import BuildHistory        from './BuildHistory'
import ParallaxBackground  from './ParallaxBackground'
import SparkButton         from './SparkButton'
import GlowingTitle        from './GlowingTitle'
import ScrollToTop         from './ScrollToTop'
import { ROLES, ROLE_COLORS } from '../data/mockData'
import { getCharacters, generateBuild, saveBuild } from '../services/api'

// ─── Role Tab Button ─────────────────────────────────────────────────────────
function RoleTab({ role, isActive, count, onClick }) {
  const colors = ROLE_COLORS[role.id]
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-5 py-2.5 rounded-full text-sm font-medium btn-transition focus-ring',
        isActive
          ? `${colors.bg} ${colors.text} ${colors.border} border`
          : 'tab-inactive',
      ].join(' ')}
    >
      {role.label}
      <span className="ml-2 text-xs opacity-60">
        {count}
      </span>
    </button>
  )
}

// ─── Search Input ────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full input-theme rounded-xl pl-11 pr-4 py-3 text-sm btn-transition focus:outline-none"
      />
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, badge, action }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-theme-primary tracking-tight">{title}</h2>
        {subtitle && <p className="text-theme-secondary text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {badge && (
          <span className="text-sm text-theme-secondary font-medium">{badge}</span>
        )}
        {action}
      </div>
    </div>
  )
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function BuilderPage({ activePage, onNavigate }) {
  // ── state ──
  const [characters,        setCharacters]        = useState([])
  const [isLoading,         setIsLoading]         = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [selectedRole,      setSelectedRole]      = useState(null)
  const [selectedEnemies,   setSelectedEnemies]   = useState([])
  const [isGenerating,      setIsGenerating]      = useState(false)
  const [buildResult,       setBuildResult]       = useState(null)
  const [isSaved,           setIsSaved]           = useState(false)
  const [charSearch,        setCharSearch]        = useState('')
  const [enemySearch,       setEnemySearch]       = useState('')
  const [activeRoleTab,     setActiveRoleTab]     = useState('all')
  const [enemyRoleTab,      setEnemyRoleTab]      = useState('all')
  const [anyRoleMode,       setAnyRoleMode]       = useState(false)

  // fetch character roster from the API on mount
  useEffect(() => {
    getCharacters()
      .then(setCharacters)
      .catch((err) => console.error('Failed to load characters:', err))
      .finally(() => setIsLoading(false))
  }, [])

  // reset role whenever the character changes
  useEffect(() => {
    setSelectedRole(null)
    setBuildResult(null)
    setIsSaved(false)
  }, [selectedCharacter])

  // wipe cached build when role or enemies change
  useEffect(() => {
    setBuildResult(null)
    setIsSaved(false)
  }, [selectedRole, selectedEnemies])

  // ── computed: character counts per role ──
  const roleCounts = useMemo(() => {
    const counts = { all: characters.length }
    ROLES.forEach(r => {
      counts[r.id] = characters.filter(c => c.roles.includes(r.id)).length
    })
    return counts
  }, [characters])

  // ── filtered lists ──
  const filteredChars = useMemo(() => {
    let list = characters

    // Filter by role tab
    if (activeRoleTab !== 'all') {
      list = list.filter(c => c.roles.includes(activeRoleTab))
    }

    // Filter by search
    if (charSearch) {
      list = list.filter(c => c.name.toLowerCase().includes(charSearch.toLowerCase()))
    }

    return list
  }, [characters, activeRoleTab, charSearch])

  // ── computed: enemy character counts per role ──
  const enemyRoleCounts = useMemo(() => {
    const available = characters.filter(c => c.id !== selectedCharacter?.id)
    const counts = { all: available.length }
    ROLES.forEach(r => {
      counts[r.id] = available.filter(c => c.roles.includes(r.id)).length
    })
    return counts
  }, [characters, selectedCharacter])

  const filteredEnemyChars = useMemo(() => {
    let list = characters.filter(c => c.id !== selectedCharacter?.id)

    // Filter by role tab
    if (enemyRoleTab !== 'all') {
      list = list.filter(c => c.roles.includes(enemyRoleTab))
    }

    // Filter by search
    if (enemySearch) {
      list = list.filter(c => c.name.toLowerCase().includes(enemySearch.toLowerCase()))
    }

    return list
  }, [characters, selectedCharacter, enemyRoleTab, enemySearch])

  // ── handlers ──
  const handleCharacterSelect = (char) => {
    setSelectedCharacter((prev) => (prev?.id === char.id ? null : char))
    setSelectedEnemies((prev) => prev.filter((e) => e.id !== char.id))
  }

  const handleEnemyToggle = (char) => {
    setSelectedEnemies((prev) => {
      if (prev.some((e) => e.id === char.id)) return prev.filter((e) => e.id !== char.id)
      if (prev.length >= 5) return prev
      return [...prev, char]
    })
  }

  const handleGenerate = async () => {
    if (!selectedCharacter || !selectedRole) return
    setIsGenerating(true)
    setBuildResult(null)
    setIsSaved(false)
    try {
      const result = await generateBuild({
        characterId: selectedCharacter.id,
        role:        selectedRole,
        enemyIds:    selectedEnemies.map((e) => e.id),
      })
      setBuildResult(result)
    } catch (err) {
      console.error('Build generation failed:', err)
      alert(err.message || 'Something went wrong. Check the server console.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!buildResult?.historyId || isSaved) return
    try {
      await saveBuild({ historyId: buildResult.historyId })
      setIsSaved(true)
    } catch (err) {
      console.error('Save failed:', err)
      alert(err.message)
    }
  }

  const canGenerate = !!(selectedCharacter && selectedRole)

  // ── render ──
  return (
    <div className="min-h-screen bg-theme-primary gradient-radial relative">
      <ParallaxBackground />
      <Header activePage={activePage} onNavigate={onNavigate} />

      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20 relative z-10">

        {/* ═══════════════════════════════════════════════ HERO SECTION ═══ */}
        <section className="text-center space-y-4 animate-fade-in">
          <GlowingTitle text="Build your champion." />
          <p className="text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
            AI-powered item recommendations tailored to your character, role, and enemy composition.
          </p>
        </section>

        {/* ═══════════════════════════════════════════════ YOUR CHARACTER ═══ */}
        <section className="animate-slide-up">
          <SectionHeader
            title="Choose Your Character"
            subtitle="Select a hero to build around"
            badge={selectedCharacter && (
              <span className="text-accent-blue">{selectedCharacter.name} selected</span>
            )}
          />

          {/* Role Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 glass rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setActiveRoleTab('all')}
              className={[
                'px-5 py-2.5 rounded-full text-sm font-medium btn-transition focus-ring',
                activeRoleTab === 'all' ? 'tab-active' : 'tab-inactive',
              ].join(' ')}
            >
              All
              <span className="ml-2 text-xs opacity-60">
                {roleCounts.all}
              </span>
            </button>
            {ROLES.map((role) => (
              <RoleTab
                key={role.id}
                role={role}
                isActive={activeRoleTab === role.id}
                count={roleCounts[role.id]}
                onClick={() => setActiveRoleTab(role.id)}
              />
            ))}
          </div>

          {/* Search */}
          <div className="max-w-sm mb-6">
            <SearchInput value={charSearch} onChange={setCharSearch} placeholder="Search characters..." />
          </div>

          {/* Character Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-theme border-t-accent-blue rounded-full animate-spin" />
            </div>
          ) : filteredChars.length === 0 ? (
            <div className="text-center py-20 text-theme-muted">
              No characters found
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {filteredChars.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isSelected={selectedCharacter?.id === char.id}
                  onClick={() => handleCharacterSelect(char)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════ YOUR ROLE ═══════ */}
        {selectedCharacter && (
          <section className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-theme-primary tracking-tight">Select Your Role</h2>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-theme-secondary text-sm min-w-[220px]">
                  {anyRoleMode ? 'All roles available' : `Available roles for ${selectedCharacter.name}`}
                </p>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-theme-muted">Any role</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={anyRoleMode}
                    onClick={() => setAnyRoleMode(prev => !prev)}
                    className={[
                      'relative w-10 h-6 rounded-full btn-transition flex items-center',
                      anyRoleMode ? 'bg-accent-blue' : 'glass border border-theme',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow btn-transition',
                        anyRoleMode ? 'right-1' : 'left-1',
                      ].join(' ')}
                    />
                  </button>
                </label>
              </div>
            </div>
            <RoleSelector
              selectedRole={selectedRole}
              availableRoles={selectedCharacter.roles}
              allowAnyRole={anyRoleMode}
              onChange={setSelectedRole}
            />

            {/* Pro Tips for selected role */}
            <ProTips role={selectedRole} />
          </section>
        )}

        {/* ═══════════════════════════════════════════════ ENEMY TEAM ═══════ */}
        <section className="animate-fade-in">
          <SectionHeader
            title="Enemy Composition"
            subtitle="Optional: Select up to 5 enemies for counter-building"
            badge={`${selectedEnemies.length} / 5`}
            action={
              selectedEnemies.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedEnemies([])}
                  className="text-sm text-theme-muted hover:text-accent-pink btn-transition"
                >
                  Clear all
                </button>
              )
            }
          />

          {/* Selected enemies pills */}
          {selectedEnemies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedEnemies.map((e) => (
                <span
                  key={e.id}
                  className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-theme-primary"
                >
                  {e.name}
                  <button
                    type="button"
                    onClick={() => handleEnemyToggle(e)}
                    className="text-theme-secondary hover:text-accent-pink btn-transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Role Tabs for Enemies */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 glass rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => setEnemyRoleTab('all')}
              className={[
                'px-5 py-2.5 rounded-full text-sm font-medium btn-transition focus-ring',
                enemyRoleTab === 'all' ? 'tab-active' : 'tab-inactive',
              ].join(' ')}
            >
              All
              <span className="ml-2 text-xs opacity-60">
                {enemyRoleCounts.all}
              </span>
            </button>
            {ROLES.map((role) => (
              <RoleTab
                key={role.id}
                role={role}
                isActive={enemyRoleTab === role.id}
                count={enemyRoleCounts[role.id]}
                onClick={() => setEnemyRoleTab(role.id)}
              />
            ))}
          </div>

          {/* Search */}
          <div className="max-w-sm mb-6">
            <SearchInput value={enemySearch} onChange={setEnemySearch} placeholder="Search enemies..." />
          </div>

          {/* Enemy Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {filteredEnemyChars.map((char) => {
              const isSelected = selectedEnemies.some((e) => e.id === char.id)
              return (
                <CharacterCard
                  key={char.id}
                  character={char}
                  isSelected={isSelected}
                  onClick={() => handleEnemyToggle(char)}
                  disabled={selectedEnemies.length >= 5 && !isSelected}
                  variant="enemy"
                />
              )
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════ GENERATE ═══════ */}
        <section className="text-center py-8">
          <SparkButton
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            isGenerating={isGenerating}
            canGenerate={canGenerate}
          />

          {!canGenerate && !isGenerating && (
            <p className="text-theme-muted text-sm mt-4">
              {!selectedCharacter ? 'Select a character to begin' : 'Select a role to continue'}
            </p>
          )}
        </section>

        {/* ═══════════════════════════════════════════════ BUILD RESULTS ═══ */}
        {buildResult && (
          <BuildResults
            result={buildResult}
            historyId={buildResult.historyId}
            isSaved={isSaved}
            onSave={handleSave}
          />
        )}

        {/* ═══════════════════════════════════════════════ BUILD HISTORY ═══ */}
        <BuildHistory />
      </main>

      <ScrollToTop />
    </div>
  )
}
