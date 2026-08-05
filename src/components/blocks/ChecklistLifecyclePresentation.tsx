import type { HTMLAttributes } from 'react'

import { AppIcon } from '@/components/icons'
import { cn } from '@/utilities/ui'

import type {
  ChecklistPresentationModel,
  LifecyclePresentationModel,
} from './checklistLifecycleModels'

export interface ChecklistPresentationProps extends HTMLAttributes<HTMLElement> {
  model: ChecklistPresentationModel
}

const ChecklistItem = ({
  appearance,
  index,
  item,
}: {
  appearance: ChecklistPresentationModel['appearance']
  index: number
  item: ChecklistPresentationModel['items'][number]
}) => (
  <li className="flex items-start gap-3">
    {appearance === 'checks' ? (
      <span
        aria-hidden
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"
      >
        <AppIcon className="size-3.5" name="check" />
      </span>
    ) : (
      <span
        aria-hidden
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white"
      >
        {index + 1}
      </span>
    )}
    <div className="min-w-0">
      {item.title ? <p className="font-semibold">{item.title}</p> : null}
      <p>{item.text}</p>
    </div>
  </li>
)

export function ChecklistPresentation({ className, model, ...props }: ChecklistPresentationProps) {
  if (!model.items.length) return null

  return model.appearance === 'numbers' ? (
    <ol className={cn('trayport-checklist grid list-none gap-4', className)} {...props}>
      {model.items.map((item, index) => (
        <ChecklistItem appearance={model.appearance} index={index} item={item} key={item.key} />
      ))}
    </ol>
  ) : (
    <ul className={cn('trayport-checklist grid list-none gap-4', className)} {...props}>
      {model.items.map((item, index) => (
        <ChecklistItem appearance={model.appearance} index={index} item={item} key={item.key} />
      ))}
    </ul>
  )
}

export interface LifecyclePresentationProps extends HTMLAttributes<HTMLElement> {
  model: LifecyclePresentationModel
}

export function LifecyclePresentation({ className, model, ...props }: LifecyclePresentationProps) {
  return (
    <section aria-label={model.caption} className={cn('trayport-lifecycle', className)} {...props}>
      {model.periods.map((period) => (
        <section className="mb-8" key={period.key}>
          <h3 className="mb-6">{period.heading}</h3>
          {period.groups.length ? (
            period.groups.map((group) => (
              <section className="mb-8" key={`${period.key}-${group.key}`}>
                <h4 className="rounded-t bg-secondary px-3 py-2 text-white">{group.label}</h4>
                <div
                  aria-label={`${period.heading}: ${group.label}`}
                  className="trayport-table-wrap"
                  role="region"
                  tabIndex={0}
                >
                  <table className="trayport-table">
                    <caption className="sr-only">
                      {model.caption}: {period.heading}, {group.label}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Product / Service</th>
                        <th scope="col">Lifecycle Duration</th>
                        <th scope="col">End-of-Life Version</th>
                        <th scope="col">End-of-Life Date</th>
                        <th scope="col">End-of-Access Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item) => (
                        <tr key={item.key}>
                          <th scope="row">
                            {item.serviceName}
                            {item.description ? (
                              <div className="mt-2 font-normal">{item.description}</div>
                            ) : null}
                          </th>
                          <td>{item.duration || '—'}</td>
                          <td>{item.endOfLifeVersion || '—'}</td>
                          <td>
                            {item.endOfLifeDate ? (
                              <time dateTime={item.endOfLifeDate.iso}>
                                {item.endOfLifeDate.label}
                              </time>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>
                            {item.endOfAccessDate ? (
                              <time dateTime={item.endOfAccessDate.iso}>
                                {item.endOfAccessDate.label}
                              </time>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))
          ) : (
            <p>No lifecycle entries in this period.</p>
          )}
        </section>
      ))}
    </section>
  )
}
