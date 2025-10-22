interface HeaderTitleProps {
    title: string
}

const HeaderTitle = ({ title }: HeaderTitleProps) => {
    return (
        <h1 
            className="header-title__container"  
        >{title}</h1>
    )
}

export default HeaderTitle