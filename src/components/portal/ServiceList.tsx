import { SUB_SERVICES } from './data'
import ServiceItem from './ServiceItem'

export default function ServiceList() {
  return (
    <section className="border-t-2 border-[#1a1a1a]">
      {SUB_SERVICES.map((service) => (
        <ServiceItem
          key={service.id}
          num={service.num}
          title={service.title}
          titleEn={service.titleEn}
          description={service.description}
          link={service.link}
          isExternal={service.isExternal}
          isNew={service.isNew}
        />
      ))}
    </section>
  )
}
