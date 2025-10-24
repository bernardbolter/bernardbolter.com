interface HeaderTitleProps {
    title: string,
    large: boolean
}

const HeaderTitle = ({ title, large = false }: HeaderTitleProps) => {
    return (
        <h1 
            className={large ? "header-title__container--large": "header-title__container"}  
        >{title}</h1>
    )
}

export default HeaderTitle