from .app import coze


def list_datasets():
    """List all datasets."""
    if coze is None:
        print("❌ Coze客户端未初始化，无法获取数据集列表")
        return []
        
    try:
        return coze.datasets.list(space_id="7532480716039438379").items
    except Exception as e:
        print(f"❌ 获取数据集列表失败: {e}")
        return []

def get_dataset(dataset_id: str):
    """Get a dataset by ID."""
    return coze.files.retrieve


if __name__ == "__main__":
    datasets = list_datasets()
    print(datasets)
