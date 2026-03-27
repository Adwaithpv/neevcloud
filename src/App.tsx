import { useEffect, useState } from 'react'
import { Sparkles, LayoutDashboard, Wallet, Users, Settings } from 'lucide-react'
import { BalanceSummary } from './components/BalanceSummary'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import { GroupManager } from './components/GroupManager'
import { InsightsPanel } from './components/InsightsPanel'
import { generateInsights, categorizeExpense } from './services/ai'
import { useExpenseStore } from './store/useExpenseStore'

function App() {
  const store = useExpenseStore()
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const [insights, setInsights] = useState<string[]>([
    'No expenses yet. Add your first expense to start receiving insights.',
  ])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!store.groupExpenses.length) return
      setIsGeneratingInsights(true)
      const data = await generateInsights(store.groupExpenses)
      if (!cancelled) {
        if (data.length > 0) {
          setInsights(data)
        }
        setIsGeneratingInsights(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [store.groupExpenses])

  return (
    <div className="dashboard-layout">
      {/* Dynamic Background Mesh */}
      <div className="bg-mesh">
        <div className="mesh-blob blob-1"></div>
        <div className="mesh-blob blob-2"></div>
      </div>

      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="brand">
          <div className="logo-icon">
            <LayoutDashboard size={24} />
          </div>
          <h1>NeevCloud Plan</h1>
        </div>

        <nav className="nav-menu">
          <div className="nav-label">Groups</div>
          <GroupManager
            groups={store.groups}
            activeGroupId={store.activeGroupId}
            onCreateGroup={store.createGroup}
            onSetActiveGroup={store.setActiveGroup}
            onAddMember={store.addMember}
          />
        </nav>

        {store.groups.length > 0 && (
          <div className="sidebar-footer">
            <button className="danger-button full-width" type="button" onClick={store.clearAll}>
              <Settings size={18} /> Reset Data
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar glass-panel">
          <div className="active-item-title">
            {store.activeGroup ? (
              <>
                <h2>{store.activeGroup.name}</h2>
                <span className="badge">
                  <Users size={14} /> {store.activeGroup.members.length} Members
                </span>
              </>
            ) : (
              <h2>Dashboard Overview</h2>
            )}
          </div>
          <div className="user-profile">
            <div className="avatar">A</div>
          </div>
        </header>

        <div className="content-scroll">
          {store.activeGroup ? (
            <div className="dashboard-grid">
              
              {/* Left Column (Actions & Forms) */}
              <div className="grid-col-left">
                <section className="glass-card form-section">
                  <div className="card-header">
                    <h3><Wallet size={20} className="icon-accent" /> Add New Expense</h3>
                  </div>
                  <ExpenseForm
                    group={store.activeGroup}
                    isSubmitting={isAddingExpense}
                    onAddExpense={async (input) => {
                      setIsAddingExpense(true)
                      const category = await categorizeExpense(input.description)
                      store.addExpense(store.activeGroup!.id, { ...input, category })
                      setIsAddingExpense(false)
                    }}
                  />
                </section>
                
                <section className="glass-card">
                  <BalanceSummary
                    group={store.activeGroup}
                    balances={store.balances}
                    transfers={store.transfers}
                    onAddSettlement={(fromMemberId, toMemberId, amount) =>
                      store.addSettlement(store.activeGroup!.id, fromMemberId, toMemberId, amount)
                    }
                  />
                </section>
              </div>

              {/* Right Column (Insights & List) */}
              <div className="grid-col-right">
                <section className="glass-card glow-border insights-section">
                   <div className="card-header">
                    <h3><Sparkles size={20} className="icon-neon" /> AI Assistant</h3>
                  </div>
                  <InsightsPanel
                    expenses={store.groupExpenses}
                    insights={insights}
                    isLoading={isGeneratingInsights}
                  />
                </section>
                
                <section className="glass-card">
                  <ExpenseList expenses={store.groupExpenses} group={store.activeGroup} />
                </section>
              </div>
              
            </div>
          ) : (
            <section className="glass-card empty-state">
              <div className="empty-state-content">
                <div className="empty-icon-wrapper">
                  <Users size={48} className="icon-muted" />
                </div>
                <h2>Start by creating a group</h2>
                <p className="muted-text">
                  Welcome to NeevCloud Plan. Use the sidebar on the left to add a group and members to begin tracking expenses.
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
